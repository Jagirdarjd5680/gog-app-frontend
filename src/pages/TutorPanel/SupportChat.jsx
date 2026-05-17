import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, TextField, IconButton, 
  Avatar, Divider, CircularProgress, Badge, Popover
} from '@mui/material';
import { 
  Send as SendIcon, 
  ArrowBack as BackIcon,
  Image as ImageIcon,
  EmojiEmotions as EmojiIcon,
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import html2pdf from 'html2pdf.js';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { fixUrl } from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
const emojiCategories = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🫣', '🤭', '🤫', '🤥', '😶', '🫥', '😐', '😑', '😬', '🫨', '🫠', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '😵‍💫', '🫨', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕']
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤙', '🤟', '🤘', '🤝', '👏', '🙌', '👐', '🤲', '🙏', '✍️', '💅', '🤳', '💪', '🦾']
  },
  {
    name: 'Hearts & Symbols',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '🔥', '✨', '⭐', '🌟', '💥', '💯', '✅', '❌', '⚠️', '🔔', '📢', '💬', '💭']
  }
];

const SupportChat = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const fileInputRef = useRef(null);
  const socket = useRef(null);
  const scrollRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    let timer;
    if (session?.status === 'completed' && session?.duration) {
      const mins = Math.floor(session.duration);
      const secs = Math.floor((session.duration % 1) * 60);
      setElapsedTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      return;
    }

    if (session?.startTime && (session.status === 'accepted' || session.status === 'active')) {
      const startTime = new Date(session.startTime).getTime();
      timer = setInterval(() => {
        const now = new Date().getTime();
        const diff = now - startTime;
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [session]);

  const handleDownloadPDF = () => {
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    
    const header = `
      <div style="border-bottom: 2px solid #C40C0C; padding-bottom: 10px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h1 style="color: #C40C0C; margin: 0;">Support Chat History</h1>
          <div style="text-align: right; font-size: 10px; color: #666;">
            Export Date: ${new Date().toLocaleString()}<br/>
            Session ID: ${sessionId}
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 15px;">
          <div style="width: 45%;">
            <h3 style="margin: 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Student Details</h3>
            <p style="margin: 5px 0; font-size: 12px;"><b>Name:</b> ${session?.student?.name}</p>
            <p style="margin: 5px 0; font-size: 12px;"><b>Roll No:</b> ${session?.student?.rollNumber || 'N/A'}</p>
            <p style="margin: 5px 0; font-size: 12px;"><b>Email:</b> ${session?.student?.email}</p>
          </div>
          <div style="width: 45%; text-align: right;">
            <h3 style="margin: 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Tutor Details</h3>
            <p style="margin: 5px 0; font-size: 12px;"><b>Name:</b> ${session?.tutor?.user?.name}</p>
            <p style="margin: 5px 0; font-size: 12px;"><b>Tutor ID:</b> ${session?.tutor?._id?.substring(session.tutor._id.length - 6).toUpperCase()}</p>
            <p style="margin: 5px 0; font-size: 12px;"><b>Email:</b> ${session?.tutor?.user?.email}</p>
          </div>
        </div>

        <div style="margin-top: 15px; padding: 8px; background: #f9f9f9; border-radius: 5px; display: flex; justify-content: space-between;">
           <span style="font-size: 12px;"><b>Total Session Duration:</b> ${elapsedTime}</span>
           <span style="font-size: 12px;"><b>Category:</b> ${session?.category || 'General Support'}</span>
        </div>
      </div>
    `;

    const chatContent = messages.map(msg => {
      const isStudent = (msg.sender === session?.student?._id || msg.sender?._id === session?.student?._id);
      const isTutor = (msg.sender === session?.tutor?.user?._id || msg.sender?._id === session?.tutor?.user?._id);
      
      // alignRight if student (Right), alignLeft if tutor (Left)
      const alignRight = isStudent;
      const bgColor = alignRight ? '#fdf2f2' : '#f5f5f5';
      const borderColor = alignRight ? '#C40C0C' : '#999';
      
      return `
        <div style="display: flex; justify-content: ${alignRight ? 'flex-end' : 'flex-start'}; margin-bottom: 15px;">
          <div style="max-width: 70%; background: ${bgColor}; border: 1px solid ${borderColor}; padding: 10px; border-radius: 10px;">
            <div style="font-size: 10px; font-weight: bold; color: ${alignRight ? '#C40C0C' : '#666'}; margin-bottom: 5px;">
              ${isStudent ? 'STUDENT' : isTutor ? 'TUTOR' : 'SYSTEM'}
            </div>
            <div style="font-size: 13px; color: #333;">${msg.message}</div>
            <div style="font-size: 9px; color: #999; margin-top: 5px; text-align: right;">
              ${new Date(msg.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      `;
    }).join('');

    element.innerHTML = header + chatContent;

    const opt = {
      margin:       10,
      filename:     `chat_${session?.student?.name}_${sessionId}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  useEffect(() => {
    fetchSessionDetails();
    setupSocket();
    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const setupSocket = () => {
    socket.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.current.emit('setup', user?._id);
    socket.current.emit('join_chat', `session_${sessionId}`);
    
    socket.current.on('message_received', (newMessage) => {
      setMessages(prev => {
        // Prevent duplicates
        const isDuplicate = prev.some(m => m._id === newMessage._id);
        if (isDuplicate) return prev;

        // If message is in this session, add it
        if (newMessage.sessionId === sessionId) {
          return [...prev, newMessage];
        } else if (newMessage.sender === session?.student?._id || newMessage.sender?._id === session?.student?._id) {
          // Fallback for legacy messages
          return [...prev, newMessage];
        }
        return prev;
      });
    });

    socket.current.on('typing', (data) => {
      if (data.senderId === session?.student?._id) {
        setIsTyping(true);
      }
    });

    socket.current.on('stop_typing', (data) => {
      if (data.senderId === session?.student?._id) {
        setIsTyping(false);
      }
    });

    socket.current.on('session_ended', (data) => {
      
      setSession(data);
    });
  };

  const fetchSessionDetails = async () => {
    try {
      
      const { data } = await axios.get(`/tutors/sessions/${sessionId}`);
      if (data.success) {
        setSession(data.data);
        
        // Load chat history between student and tutor of this session
        const historyRes = await axios.get(`/chat/session-history/${sessionId}`);
        setMessages(historyRes.data.data);
        
      }
    } catch (error) {
      
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !imageFile) || sending) return;

    setSending(true);
    try {
      let data;
      if (imageFile) {
        const formData = new FormData();
        formData.append('receiver', session.student._id);
        formData.append('message', input.trim());
        formData.append('sessionId', sessionId);
        formData.append('image', imageFile);

        const res = await axios.post('/chat/send', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        data = res.data;
      } else {
        const res = await axios.post('/chat/send', {
          receiver: session.student._id,
          message: input.trim(),
          sessionId: sessionId
        });
        data = res.data;
      }

      if (data.success) {
        const messageWithSession = { ...data.data, sessionId };
        setMessages(prev => {
          const exists = prev.some(m => m._id === messageWithSession._id);
          if (exists) return prev;
          return [...prev, messageWithSession];
        });
        socket.current.emit('new_message', messageWithSession);
        setInput('');
        clearImage();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 0, boxShadow: 1 }}>
        <IconButton onClick={() => {
          if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
          } else {
            navigate(user?.role === 'admin' ? '/tutor-chats' : '/tutor/requests');
          }
        }}>
          <BackIcon />
        </IconButton>
        <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color="success">
          <Avatar src={session?.student?.profileImage}>{session?.student?.name?.[0]}</Avatar>
        </Badge>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{session?.student?.name}</Typography>
            <Typography variant="caption" color="textSecondary">
              ID: {session?.student?._id?.substring(session.student._id.length - 6).toUpperCase()} • {session?.student?.email}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              {elapsedTime}
            </Typography>
            <Typography variant="caption" color="textSecondary">Session Duration</Typography>
          </Box>

          {user?.role === 'admin' && (
            <IconButton color="primary" onClick={handleDownloadPDF} sx={{ ml: 2 }} title="Download Chat PDF">
              <DownloadIcon />
            </IconButton>
          )}
      </Paper>

      {/* Messages */}
      <Box 
        ref={scrollRef}
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1.5,
          backgroundColor: '#f9f9f9'
        }}
      >
        {messages.map((msg, i) => {
          const tutorUserId = session?.tutor?.user?._id || session?.tutor?.user;
          const studentUserId = session?.student?._id || session?.student;

          const isTutor = (msg.sender === tutorUserId || msg.sender?._id === tutorUserId);
          const isStudent = (msg.sender === studentUserId || msg.sender?._id === studentUserId);
          
          // Tutor on RIGHT, Student on LEFT
          const alignRight = isTutor;

          return (
            <Box key={i} sx={{ alignSelf: alignRight ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
              <Paper 
                sx={{ 
                  p: 1.5, 
                  backgroundColor: alignRight ? '#C40C0C' : 'white', 
                  color: alignRight ? 'white' : 'black',
                  borderRadius: alignRight ? '20px 20px 0 20px' : '20px 20px 20px 0',
                  boxShadow: 1,
                  border: alignRight ? 'none' : '1px solid #eee'
                }}
              >
                {(msg.image || msg.file) && (
                  <Box 
                    component="img" 
                    src={fixUrl(msg.image || msg.file)} 
                    sx={{ 
                      maxWidth: '200px', 
                      maxHeight: '200px', 
                      objectFit: 'cover',
                      borderRadius: 1, 
                      mb: 0.5,
                      cursor: 'pointer'
                    }} 
                    onClick={() => window.open(fixUrl(msg.image || msg.file), '_blank')}
                  />
                )}
                {msg.video && (
                  <Box 
                    component="video" 
                    src={fixUrl(msg.video)} 
                    controls 
                    sx={{ maxWidth: '200px', borderRadius: 1, mb: 0.5 }} 
                  />
                )}
                <Typography variant="body2">{msg.message}</Typography>
              </Paper>
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: alignRight ? 'right' : 'left', color: 'text.secondary' }}>
                {isTutor ? 'Tutor' : isStudent ? 'Student' : 'System'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          );
        })}
        {isTyping && (
          <Box sx={{ alignSelf: 'flex-start', p: 1, backgroundColor: '#f0f0f0', borderRadius: 2 }}>
            <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              Student is typing...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Input Area */}
      {user?.role === 'admin' ? null : 
       session?.status === 'completed' ? (
         <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5', borderTop: '1px solid #ddd' }}>
           <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>This session has ended</Typography>
         </Box>
       ) : (
         <Box sx={{ display: 'flex', flexDirection: 'column', mr: '90px' }}>
           {imagePreview && (
             <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2, borderTop: '1px solid #eee', bgcolor: 'white' }}>
               <Box sx={{ position: 'relative' }}>
                 <Box 
                   component="img" 
                   src={imagePreview} 
                   sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 2 }} 
                 />
                 <IconButton 
                   size="small" 
                   onClick={clearImage}
                   sx={{ 
                     position: 'absolute', 
                     top: -8, 
                     right: -8, 
                     bgcolor: 'rgba(0,0,0,0.6)', 
                     color: 'white',
                     '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                   }}
                 >
                   <CloseIcon sx={{ fontSize: 14 }} />
                 </IconButton>
               </Box>
               <Typography variant="caption" color="text.secondary">
                 Ready to send
               </Typography>
             </Box>
           )}
           <Paper component="form" onSubmit={handleSend} sx={{ p: 2, borderRadius: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
             <IconButton size="small" onClick={(e) => setEmojiAnchorEl(e.currentTarget)}>
               <EmojiIcon color="action" />
             </IconButton>
             <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
               <ImageIcon color="action" />
             </IconButton>
             
             {/* Hidden File Input */}
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleImageChange} 
               accept="image/*" 
               style={{ display: 'none' }} 
             />

             <TextField 
               fullWidth 
               size="small" 
               placeholder="Type a message..." 
               value={input}
               onChange={(e) => {
                 setInput(e.target.value);
                 if (socket.current) {
                   socket.current.emit('typing', { room: session.student._id, senderId: user._id });
                 }
               }}
               onBlur={() => {
                 if (socket.current) {
                   socket.current.emit('stop_typing', { room: session.student._id, senderId: user._id });
                 }
               }}
               sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5 } }}
             />
             <IconButton color="primary" onClick={handleSend} disabled={sending}>
               <SendIcon />
             </IconButton>
           </Paper>

           {/* Emojis Popover */}
           <Popover
             open={Boolean(emojiAnchorEl)}
             anchorEl={emojiAnchorEl}
             onClose={() => setEmojiAnchorEl(null)}
             anchorOrigin={{
               vertical: 'top',
               horizontal: 'left',
             }}
             transformOrigin={{
               vertical: 'bottom',
               horizontal: 'left',
             }}
             PaperProps={{
               sx: { p: 2, maxWidth: 320, maxHeight: 350, overflowY: 'auto', borderRadius: 3 }
             }}
           >
             {emojiCategories.map((cat, i) => (
               <Box key={i} sx={{ mb: 1.5 }}>
                 <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                   {cat.name}
                 </Typography>
                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                   {cat.emojis.map((emoji) => (
                     <IconButton
                       key={emoji}
                       size="small"
                       onClick={() => {
                         setInput(prev => prev + emoji);
                       }}
                       sx={{ fontSize: '1.2rem', p: 0.5 }}
                     >
                       {emoji}
                     </IconButton>
                   ))}
                 </Box>
               </Box>
             ))}
           </Popover>
         </Box>
       )}
    </Box>
  );
};

export default SupportChat;
