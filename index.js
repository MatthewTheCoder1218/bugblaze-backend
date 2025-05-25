// index.js
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PRODUCT_ID = process.env.GUMROAD_PRODUCT_ID;

// POST /api/check-key
app.post('/api/check-key', async (req, res) => {
  const { license_key } = req.body;

if (!license_key) {
    return res.status(400).json({ success: false, message: 'Missing license key' });
  }

  try {
        const formData = new FormData();
    formData.append('product_id', PRODUCT_ID);
    formData.append('license_key', license_key);

    // Debug log request data
    console.log('Request Data:', {
      url: 'https://api.gumroad.com/v2/licenses/verify',
      product_id: PRODUCT_ID,
      license_key: license_key
    });

    const response = await axios({
      method: 'post',
      url: 'https://api.gumroad.com/v2/licenses/verify',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Debug log
    console.log('Gumroad Response:', response.data);

    if (response.data.success) {
      return res.json({
        success: true,
        isPremium: true,
        email: response.data.purchase.email,
        purchase_date: response.data.purchase.sale_timestamp,
        variants: response.data.purchase.variants,
      });
    } else {
      return res.status(403).json({ success: false, isPremium: false, message: 'Invalid license key' });
    }
  } catch (err) {
    // Enhanced error logging
    console.error('Error verifying license:', {
      message: err.message,
      responseData: err.response?.data,
      status: err.response?.status,
      id: PRODUCT_ID,
      headers: err.response?.headers
    });
    return res.status(500).json({ 
      success: false, 
      message: err.response?.data?.message || 'Server error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 BugBlaze backend running on http://localhost:${PORT}`);
});
