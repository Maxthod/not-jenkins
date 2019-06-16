module.exports = {
    validateSecret : function(req, secret) {
        // Compare their hmac signature to our hmac signature
        // (hmac = hash-based message authentication code)
        const theirSignature = req.headers['x-hub-signature'];
        const payload = JSON.stringify(req.body);
        const ourSignature = `sha1=${crypto.createHmac('sha1', secret).update(payload).digest('hex')}`;
        return crypto.timingSafeEqual(Buffer.from(theirSignature), Buffer.from(ourSignature));
    }
}