const Image = require('../models/Image');
const {uploadToCloudinary} = require('../helpers/cloudinaryHelper');
const fs = require('fs');
const cloudinary = require('../config/cloudinary')

const uploadImageController = async(req, res) => {
    try{
        if(!req.file) {
            return res.status(400).json({
                success : false,
                message : 'File is required! Please upload an image'
            })
        }

        const {url,publicID} = await uploadToCloudinary(req.file.path);
        const newlyUploadedImage = new Image({
            url,
            publicID,
            uploadedBy : req.userInfo.userId
        })

        await newlyUploadedImage.save();

        fs.unlinkSync(req.file.path);

        res.status(201).json({
            success : true,
            message : 'Image uploaded successfully',
            image : newlyUploadedImage
        })
    }catch(error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : 'Something went wrong! Please try again'
        })
    }
}

const fetchImagesController = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;
        const skip = (page -1) * limit;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceil(totalImages / limit);

        const sortObj = {};
        sortObj[sortBy] = sortOrder
        const images = await Image.find().sort(sortObj).skip(skip).limit(limit);

        
        if(images) {
            res.status(200).json({
                success : true,
                currentPage : page,
                totalPages : totalPages,
                totalImages : totalImages,
                data : images
            })
        }
    }catch(error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : 'Something went wrong! Please try again'
        })
    }
} 

const deleteImageController = async(req, res) => {
    try{
        const getCurrentIdofImageToBeDeleted = req.params.id;
        const userId = req.userInfo.userId;
        const image = await Image.findById(getCurrentIdofImageToBeDeleted);

        if(!image) {
            return res.status(404).json({
                success : false,
                message : 'Image is not found'
            })
        }

        if(image.uploadedBy.toString() !== userId) {
            return res.status(403).json({
                success : false,
                message : 'You are not authorized to delete this image'
            })
        }

        await cloudinary.uploader.destroy(image.publicID);

        await Image.findByIdAndDelete(getCurrentIdofImageToBeDeleted);

        res.status(200).json({
            success : true,
            message : 'Image deleted successfully'
        })
    } catch(error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : 'Something went wrong! Please try again'
        })
    }
}

module.exports = {
    uploadImageController,
    fetchImagesController,
    deleteImageController
}
