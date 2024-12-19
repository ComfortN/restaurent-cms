const multer = require('multer');
const { db } = require('../config/firestore');
const { collection, addDoc, deleteDoc, doc } = require('firebase/firestore');

// Configure multer
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Export the multer instance instead of a configured middleware
const multerUpload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Convert file to Base64
const convertToBase64 = (file) => {
    try {
        return Buffer.from(file.buffer).toString('base64');
    } catch (error) {
        console.error('Error converting file to base64:', error);
        throw new Error('Failed to process image');
    }
};


console.log('Firestore DB instance:', !!db);

// Save image to Firestore
const saveToFirestore = async (file, restaurantId) => {
    if (!file || !file.buffer) {
        console.log('No file received in saveToFirestore');
        throw new Error('No file provided');
    }

    try {
        console.log('Processing image upload:', {
            name: file.originalname,
            type: file.mimetype,
            size: file.size,
            restaurantId: restaurantId
        });

        const base64Image = convertToBase64(file);
        const imageData = {
            data: `data:${file.mimetype};base64,${base64Image}`,
            originalName: file.originalname,
            mimetype: file.mimetype,
            restaurantId: restaurantId,
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'restaurantImages'), imageData);
        console.log('Image saved to Firestore with ID:', docRef.id);

        return {
            id: docRef.id,
            originalName: file.originalname,
            mimetype: file.mimetype,
            url: `data:${file.mimetype};base64,${base64Image}`
        };
    } catch (error) {
        console.error('Error saving to Firestore:', error);
        throw new Error('Failed to save image to storage');
    }
};

// Delete image from Firestore
const deleteFromFirestore = async (imageId) => {
    try {
        await deleteDoc(doc(db, 'restaurantImages', imageId));
    } catch (error) {
        console.error('Error deleting from Firestore:', error);
        throw error;
    }
};

module.exports = {
    upload: multerUpload, // Export the multer instance
    saveToFirestore,
    deleteFromFirestore
};