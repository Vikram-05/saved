import DataModel from "../models/Data.model.js";
import {uploadImage} from "../services/cloudinary.service.js";

export const saveData = async (req, res) => {
    const { key ,type} = req.body;
    const data = req.body?.data;
    
    try {
        if (!key) {
            return res.status(400).json({ message: "Key is required" })
        }
        const isKeyExists = await DataModel.findOne({ key });
        if (isKeyExists) {
            return res.status(400).json({ message: "Key already exists" })
        }
        
        
        if(type == 'file'){
            if (!req.files) {
                return res.status(400).json({ message: "No file provided" })
            }
            // Use the file path from multer
            let fileData = req.files[0]?.path;
            console.log('File data path:', fileData);
            const uploadResponse = await uploadImage(fileData);
            if(!uploadResponse){
                return  res.status(500).json({ message: "Image upload failed" })
            }
            fileData = uploadResponse.secure_url || uploadResponse;
            const newData = new DataModel({ key, data: fileData, type });
            const response = await newData.save();
            res.status(200).json({ message: "Data saved successfully", data: response })
        }
        
        const newData = new DataModel({ key, data, type });
        const response = await newData.save();
        res.status(200).json({ message: "Data saved successfully", data: response })
    } catch (error) {
        console.error("Error in saveData:", error);
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}
export const getData = async (req, res) => {
    const { key } = req.body;
    try {
        if (!key) {
            return res.status(400).json({ message: "Key is required" })
        }
        const response = await DataModel.findOne({ key });
        if (!response) {
            return res.status(404).json({ message: "Data not found" })
        }
        res.status(200).json({ message: "Data retrieved successfully", data: response })
    } catch (error) {
        res.status(500).json({ message: "Server Error" })
    }
}
export const updateKey = async (req, res) => {
    const { oldKey, newKey } = req.body;
    try {
        const isOldKeyExists = await DataModel.findOne({ key: oldKey });
        if (!isOldKeyExists) {
            res.status(404).json({ message: "Old Key not found" })
        }
        const isKeyExists = await DataModel.findOne({ key: newKey });
        if (isKeyExists) {
            res.status(400).json({ message: "Key already exists try another unique new key" })
        }
        const response = await DataModel.findOneAndUpdate({ key: oldKey }, { key: newKey }, { new: true });
        res.status(200).json({ message: "Key updated successfully", data: response })
    } catch (error) {
        res.status(500).json({ message: "Server Error" })
    }
}