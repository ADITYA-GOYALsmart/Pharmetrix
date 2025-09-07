import express from "express";


export const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send('Welcome to SPIS Streaming Node Backend');
});

router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});