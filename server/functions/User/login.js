const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = mongoose.model('User');

module.exports = (req, res) => {
    if(!req.body.email) return res.status(400).send('Missing email');
    if(!req.body.password) return res.status(400).send('Missing password');

    req.body.email = req.body.email.toLowerCase();

    User.findOne({ email : req.body.email }).populate('active_profile').exec(function(err, user) {
        if (err) return res.status(500).send(err);
        if (!user) return res.status(404).send('User with email address cannot be found');
        bcrypt.compare(req.body.password, user.password, function (err, verified) {
            if(err) return res.status(500).send(err);
            if(!verified) return res.status(401).send('Incorrect password');
            return res.json({
                user: {
                    _id: user._id,
                    email: user.email,
                },
                active_profile: user.active_profile,
                token: jwt.sign(
                    {
                        email: user.email,
                    }, config.secret, {
                        expiresIn: '168h'
                    }
                )
            });
        });
    });
};
