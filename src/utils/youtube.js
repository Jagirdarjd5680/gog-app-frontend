export const getYoutubeId = (url) => {
    if (!url) return null;
    // "live/" is its own path shape (copied off a live broadcast's watch page), distinct from
    // the other lookalikes below — matched first so a live link doesn't fall through unresolved.
    const liveMatch = url.match(/youtube\.com\/live\/([\w-]{11})/);
    if (liveMatch) return liveMatch[1];
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// rel=0 restricts end-screen suggestions to the same channel (YouTube no longer allows fully
// disabling them), modestbranding trims the YouTube logo, iv_load_policy=3 hides annotations.
// There's no official param to remove the Share button or channel name — YouTube's ToS requires
// attribution stay visible on embeds, so this is as minimal as embedding allows.
export const getYoutubeEmbedUrl = (url) => {
    const videoId = getYoutubeId(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3`;
};

/**
 * Resolves to { duration, errorCode }. `errorCode` is null on success, or the
 * YouTube IFrame Player API error code (2 = invalid id, 5 = HTML5 player
 * error, 100 = video removed/private, 101 / 150 = the video owner disabled
 * playback on other websites) so callers can tell "still working" apart from
 * "this video can never be embedded here" instead of silently getting 0.
 */
export const getYoutubeVideoDuration = (youtubeUrl) => {
    return new Promise((resolve) => {
        const videoId = getYoutubeId(youtubeUrl);
        if (!videoId) {
            resolve({ duration: 0, errorCode: 'invalid_url' });
            return;
        }

        // 1. Load YouTube script if not present
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        const checkYTApi = () => {
            if (window.YT && window.YT.Player) {
                // Create a hidden div for player
                const tempId = `yt-temp-player-${Math.random().toString(36).substring(2, 11)}`;
                const tempDiv = document.createElement('div');
                tempDiv.id = tempId;
                tempDiv.style.position = 'absolute';
                tempDiv.style.width = '0px';
                tempDiv.style.height = '0px';
                tempDiv.style.pointerEvents = 'none';
                tempDiv.style.opacity = '0';
                document.body.appendChild(tempDiv);

                let resolved = false;
                let player = new window.YT.Player(tempId, {
                    videoId: videoId,
                    playerVars: {
                        mute: 1,
                        autoplay: 0,
                        controls: 0,
                        showinfo: 0,
                        rel: 0
                    },
                    events: {
                        onReady: (event) => {
                            setTimeout(() => {
                                if (!resolved) {
                                    resolved = true;
                                    const d = Math.round(event.target.getDuration());
                                    resolve({ duration: d, errorCode: d > 0 ? null : 'no_duration' });
                                    try {
                                        event.target.destroy();
                                        document.body.removeChild(tempDiv);
                                    } catch (e) {}
                                }
                            }, 800);
                        },
                        onStateChange: (event) => {
                            if (event.data === window.YT.PlayerState.UNSTARTED ||
                                event.data === window.YT.PlayerState.BUFFERING ||
                                event.data === window.YT.PlayerState.PLAYING) {
                                setTimeout(() => {
                                    if (!resolved) {
                                        resolved = true;
                                        const d = Math.round(event.target.getDuration());
                                        resolve({ duration: d, errorCode: d > 0 ? null : 'no_duration' });
                                        try {
                                            event.target.destroy();
                                            document.body.removeChild(tempDiv);
                                        } catch (e) {}
                                    }
                                }, 500);
                            }
                        },
                        onError: (event) => {
                            if (!resolved) {
                                resolved = true;
                                resolve({ duration: 0, errorCode: event?.data ?? 'unknown' });
                                try {
                                    player.destroy();
                                    document.body.removeChild(tempDiv);
                                } catch (e) {}
                            }
                        }
                    }
                });

                // Safety timeout after 5 seconds
                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        resolve({ duration: 0, errorCode: 'timeout' });
                        try {
                            player.destroy();
                            document.body.removeChild(tempDiv);
                        } catch (e) {}
                    }
                }, 5000);
            } else {
                setTimeout(checkYTApi, 100);
            }
        };

        checkYTApi();
    });
};
