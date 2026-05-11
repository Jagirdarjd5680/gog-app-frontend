import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Button,
    Tabs,
    Tab,
    Divider,
    Stack,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Radio
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';

const PDFFormatsSettings = ({ settings, onSave, isSaving }) => {
    const [tabValue, setTabValue] = useState(0);
    const [formats, setFormats] = useState({
        receiptTemplate: settings?.pdfFormats?.receiptTemplate || 'format1',
        registrationTemplate: settings?.pdfFormats?.registrationTemplate || 'format1',
        certificateTemplate: settings?.pdfFormats?.certificateTemplate || 'format1'
    });

    const [previewImage, setPreviewImage] = useState(null);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleSelectFormat = (field, format) => {
        setFormats(prev => ({ ...prev, [field]: format }));
    };

    const handleSave = () => {
        onSave({ pdfFormats: formats });
    };

    const receiptTemplates = [
        {
            id: 'format1',
            name: 'Classic Professional',
            description: 'A clean, business-oriented receipt with detailed fee breakdown and terms.',
            image: 'https://backend.godofgraphics.in/uploads/image-1778249408006-694784283-frst-pdf-1.jpg'
        },
        {
            id: 'format2',
            name: 'Modern Tax Invoice',
            description: 'Elegant tax invoice layout with signatory section and professional headers.',
            image: 'https://backend.godofgraphics.in/uploads/image-1778249401308-112085269-secpnd-pdf.jpg'
        }
    ];

    return (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            {/* Lightbox Modal */}
            <Dialog 
                open={!!previewImage} 
                onClose={() => setPreviewImage(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Template Preview
                    <IconButton onClick={() => setPreviewImage(null)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <img 
                        src={previewImage} 
                        alt="Preview" 
                        style={{ width: '100%', height: 'auto', display: 'block' }} 
                    />
                </DialogContent>
            </Dialog>

            <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography variant="h6" fontWeight={700}>PDF Document Formats</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Choose and customize the design of your official documents.</Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
                    <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="Payment Receipts" />
                    <Tab icon={<AssignmentIcon />} iconPosition="start" label="Registration Letter" />
                    <Tab icon={<CardMembershipIcon />} iconPosition="start" label="Certificates" />
                </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
                {tabValue === 0 && (
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight={700}>Select Receipt Template</Typography>
                            <Chip 
                                label={`Active: ${formats.receiptTemplate === 'format1' ? 'Classic' : 'Modern'}`} 
                                color="primary" 
                                variant="outlined" 
                                size="small" 
                            />
                        </Stack>
                        
                        <Grid container spacing={3}>
                            {receiptTemplates.map((template) => (
                                <Grid item xs={12} md={6} key={template.id}>
                                    <Card 
                                        sx={{ 
                                            borderRadius: 2, 
                                            border: formats.receiptTemplate === template.id ? '2px solid' : '1px solid',
                                            borderColor: formats.receiptTemplate === template.id ? 'primary.main' : 'divider',
                                            position: 'relative',
                                            transition: '0.3s',
                                            '&:hover': { 
                                                boxShadow: 10,
                                                '& .preview-overlay': { opacity: 1 }
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                            <CardMedia
                                                component="img"
                                                height="300"
                                                image={template.image}
                                                alt={template.name}
                                                sx={{ 
                                                    filter: formats.receiptTemplate === template.id ? 'none' : 'grayscale(0.5)',
                                                    cursor: 'pointer',
                                                    objectPosition: 'top'
                                                }}
                                                onClick={() => setPreviewImage(template.image)}
                                            />
                                            {/* Preview Overlay */}
                                            <Box 
                                                className="preview-overlay"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0, left: 0, right: 0, bottom: 0,
                                                    bgcolor: 'rgba(0,0,0,0.3)',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    opacity: 0,
                                                    transition: '0.3s',
                                                    pointerEvents: 'none'
                                                }}
                                            >
                                                <Button 
                                                    variant="contained" 
                                                    size="small" 
                                                    startIcon={<VisibilityIcon />}
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: '#000', '&:hover': { bgcolor: '#fff' } }}
                                                >
                                                    View Preview
                                                </Button>
                                            </Box>
                                        </Box>
                                        <CardActionArea onClick={() => handleSelectFormat('receiptTemplate', template.id)}>
                                            <CardContent>
                                                <Typography gutterBottom variant="h6" component="div" fontWeight={700}>
                                                    {template.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {template.description}
                                                </Typography>
                                                <Divider sx={{ my: 2 }} />
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Radio
                                                        checked={formats.receiptTemplate === template.id}
                                                        value={template.id}
                                                        name="receipt-template"
                                                        color="primary"
                                                        size="small"
                                                        sx={{ p: 0 }}
                                                    />
                                                    <Typography variant="body2" fontWeight={600} color={formats.receiptTemplate === template.id ? 'primary.main' : 'text.secondary'}>
                                                        {formats.receiptTemplate === template.id ? 'Primary Template' : 'Set as Primary'}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </CardActionArea>
                                        {formats.receiptTemplate === template.id && (
                                            <Box sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#fff', borderRadius: '50%', boxShadow: 2 }}>
                                                <CheckCircleIcon color="primary" />
                                            </Box>
                                        )}
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {tabValue === 1 && (
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight={700}>Select Registration Template</Typography>
                            <Chip 
                                label={`Active: ${formats.registrationTemplate === 'format1' ? 'Classic' : 'Detailed'}`} 
                                color="primary" 
                                variant="outlined" 
                                size="small" 
                            />
                        </Stack>
                        
                        <Grid container spacing={3}>
                            {[
                                {
                                    id: 'format1',
                                    name: 'Classic Confirmation',
                                    description: 'Simple and direct registration confirmation with chosen module and fee structure.',
                                    image: 'https://backend.godofgraphics.in/uploads/image-1778483223169-663590044-registrt-1.jpg'
                                },
                                {
                                    id: 'format2',
                                    name: 'Detailed Admission Letter',
                                    description: 'Comprehensive admission letter with student grid, detailed fee summary and instructions.',
                                    image: 'https://backend.godofgraphics.in/uploads/image-1778483202920-531025118-register-2.jpg'
                                }
                            ].map((template) => (
                                <Grid item xs={12} md={6} key={template.id}>
                                    <Card 
                                        sx={{ 
                                            borderRadius: 2, 
                                            border: formats.registrationTemplate === template.id ? '2px solid' : '1px solid',
                                            borderColor: formats.registrationTemplate === template.id ? 'primary.main' : 'divider',
                                            position: 'relative',
                                            transition: '0.3s',
                                            '&:hover': { 
                                                boxShadow: 10,
                                                '& .preview-overlay': { opacity: 1 }
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                            <CardMedia
                                                component="img"
                                                height="300"
                                                image={template.image}
                                                alt={template.name}
                                                sx={{ 
                                                    filter: formats.registrationTemplate === template.id ? 'none' : 'grayscale(0.5)',
                                                    cursor: 'pointer',
                                                    objectPosition: 'top'
                                                }}
                                                onClick={() => setPreviewImage(template.image)}
                                            />
                                            <Box 
                                                className="preview-overlay"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0, left: 0, right: 0, bottom: 0,
                                                    bgcolor: 'rgba(0,0,0,0.3)',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    opacity: 0,
                                                    transition: '0.3s',
                                                    pointerEvents: 'none'
                                                }}
                                            >
                                                <Button 
                                                    variant="contained" 
                                                    size="small" 
                                                    startIcon={<VisibilityIcon />}
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: '#000', '&:hover': { bgcolor: '#fff' } }}
                                                >
                                                    View Preview
                                                </Button>
                                            </Box>
                                        </Box>
                                        <CardActionArea onClick={() => handleSelectFormat('registrationTemplate', template.id)}>
                                            <CardContent>
                                                <Typography gutterBottom variant="h6" component="div" fontWeight={700}>
                                                    {template.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {template.description}
                                                </Typography>
                                                <Divider sx={{ my: 2 }} />
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Radio
                                                        checked={formats.registrationTemplate === template.id}
                                                        value={template.id}
                                                        name="registration-template"
                                                        color="primary"
                                                        size="small"
                                                        sx={{ p: 0 }}
                                                    />
                                                    <Typography variant="body2" fontWeight={600} color={formats.registrationTemplate === template.id ? 'primary.main' : 'text.secondary'}>
                                                        {formats.registrationTemplate === template.id ? 'Primary Template' : 'Set as Primary'}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </CardActionArea>
                                        {formats.registrationTemplate === template.id && (
                                            <Box sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#fff', borderRadius: '50%', boxShadow: 2 }}>
                                                <CheckCircleIcon color="primary" />
                                            </Box>
                                        )}
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {tabValue === 2 && (
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight={700}>Select Certificate Template</Typography>
                            <Chip 
                                label={`Active: ${formats.certificateTemplate === 'format1' ? 'Professional' : 'Training'}`} 
                                color="primary" 
                                variant="outlined" 
                                size="small" 
                            />
                        </Stack>
                        
                        <Grid container spacing={3}>
                            {[
                                {
                                    id: 'format1',
                                    name: 'Professional Achievement',
                                    description: 'A formal certificate with red and gold accents, ideal for professional courses and high-score achievements.',
                                    image: 'https://backend.godofgraphics.in/uploads/image-1778468831519-891940570-certificate-1.jpg'
                                },
                                {
                                    id: 'format2',
                                    name: 'Training Completion',
                                    description: 'A clean, modern blue-themed certificate perfect for industrial training and workshop completion.',
                                    image: 'https://backend.godofgraphics.in/uploads/image-1778468943115-931503125-certificat-2.jpg'
                                }
                            ].map((template) => (
                                <Grid item xs={12} md={6} key={template.id}>
                                    <Card 
                                        sx={{ 
                                            borderRadius: 2, 
                                            border: formats.certificateTemplate === template.id ? '2px solid' : '1px solid',
                                            borderColor: formats.certificateTemplate === template.id ? 'primary.main' : 'divider',
                                            position: 'relative',
                                            transition: '0.3s',
                                            '&:hover': { 
                                                boxShadow: 10,
                                                '& .preview-overlay': { opacity: 1 }
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                            <CardMedia
                                                component="img"
                                                height="300"
                                                image={template.image}
                                                alt={template.name}
                                                sx={{ 
                                                    filter: formats.certificateTemplate === template.id ? 'none' : 'grayscale(0.5)',
                                                    cursor: 'pointer',
                                                    objectPosition: 'top'
                                                }}
                                                onClick={() => setPreviewImage(template.image)}
                                            />
                                            <Box 
                                                className="preview-overlay"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0, left: 0, right: 0, bottom: 0,
                                                    bgcolor: 'rgba(0,0,0,0.3)',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    opacity: 0,
                                                    transition: '0.3s',
                                                    pointerEvents: 'none'
                                                }}
                                            >
                                                <Button 
                                                    variant="contained" 
                                                    size="small" 
                                                    startIcon={<VisibilityIcon />}
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: '#000', '&:hover': { bgcolor: '#fff' } }}
                                                >
                                                    View Preview
                                                </Button>
                                            </Box>
                                        </Box>
                                        <CardActionArea onClick={() => handleSelectFormat('certificateTemplate', template.id)}>
                                            <CardContent>
                                                <Typography gutterBottom variant="h6" component="div" fontWeight={700}>
                                                    {template.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {template.description}
                                                </Typography>
                                                <Divider sx={{ my: 2 }} />
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Radio
                                                        checked={formats.certificateTemplate === template.id}
                                                        value={template.id}
                                                        name="certificate-template"
                                                        color="primary"
                                                        size="small"
                                                        sx={{ p: 0 }}
                                                    />
                                                    <Typography variant="body2" fontWeight={600} color={formats.certificateTemplate === template.id ? 'primary.main' : 'text.secondary'}>
                                                        {formats.certificateTemplate === template.id ? 'Primary Template' : 'Set as Primary'}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </CardActionArea>
                                        {formats.certificateTemplate === template.id && (
                                            <Box sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#fff', borderRadius: '50%', boxShadow: 2 }}>
                                                <CheckCircleIcon color="primary" />
                                            </Box>
                                        )}
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                        variant="contained" 
                        startIcon={<SaveIcon />} 
                        onClick={handleSave}
                        disabled={isSaving}
                        sx={{ borderRadius: 2, px: 4, py: 1.2 }}
                    >
                        {isSaving ? 'Saving...' : 'Apply PDF Changes'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default PDFFormatsSettings;
