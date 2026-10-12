const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async(filePath) => {
    try{
        const result = await cloudinary.uploader.upload(filePath);
        return {
            url : result.secure_url,
            publicID : result.public_id
        }
    }catch(e) {
        console.error('Error while uploading to cloudinary', error)
        throw new Error('Error while uploading to cloudinary')
    }
}

module.exports = { uploadToCloudinary };
