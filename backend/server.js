const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

dotenv.config();
mongoose.set('strictQuery', false);

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

const imageSchema = new mongoose.Schema({
    imageData: {
        type: String,
        required: true
    },
    annotations: {
        type: Object,
        required: true
    }
});

const Image = mongoose.model('Image', imageSchema);

// User model
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT secret key
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key';

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Multer setup for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Vision API configuration
const VISION_API_KEY = process.env.VISION_API_KEY;
const VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate";

// Route for user registration
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).send('User registered');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

// Route for user login and JWT token generation
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username: username });

        if (user && await bcrypt.compare(password, user.password)) {
            const accessToken = jwt.sign({ username: user.username }, JWT_SECRET_KEY);
            res.json({ accessToken: accessToken });
        } else {
            res.status(403).send('Invalid credentials');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});

// Route for uploading and annotating images
app.post('/annotate', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const imageData = req.file.buffer.toString('base64');

        const visionReq = {
            requests: [
                {
                    image: {
                        content: imageData
                    },
                    features: [
                        {
                            type: 'LABEL_DETECTION',
                            maxResults: 5
                        }
                    ]
                }
            ]
        };

        const visionRes = await axios.post(VISION_API_URL, visionReq, {
            params: {
                key: VISION_API_KEY
            }
        });

        const annotations = visionRes.data.responses[0].labelAnnotations.map(annotation => ({
            label: annotation.description,
            score: annotation.score
        }));

        const newImage = new Image({
            imageData: imageData,
            annotations: annotations
        });

        await newImage.save();

        res.json({ annotations: annotations });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error annotating image');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
