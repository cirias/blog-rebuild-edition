var bcrypt = require('bcrypt');
var mongodb = require('./mongodb.js');
var message = require('../config.js').message;
var config = require('../config.js').config.user;

var Schema = mongodb.mongoose.Schema;

var UserSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number }
});

UserSchema.virtual('isLocked').get(function() {
    // 检查lockUtil是否为未来时间戳
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.pre('save', function(next) {
    var user = this;

    // 若未修改密码则跳过
    if (!user.isModified('password')) return next();

    // 生成salt
    bcrypt.genSalt(config.SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // 用salt生成密码哈希值
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // 用哈希值替代用户密码
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.methods.incLoginAttempts = function(cb) {
    // 如果lockUtil已过期，初始化loginAttempts为1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, cb);
    }
    // 否则加1
    var updates = { $inc: { loginAttempts: 1 } };
    
    // 如果到达最大尝试次数，设置lockUntil，锁定
    if ((this.loginAttempts + 1) >= config.MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + config.LOCK_TIME };
    }
    return this.update(updates, cb);
};

// 枚举失败原因代号，并绑定到静态量failedLogin
var reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

UserSchema.static('getAuthenticated', function(username, password, cb) {
    this.findOne({ username: username }, function(err, user) {
        if (err) return cb(err);

        // 检查user是否存在
        if (!user) {
            return cb(null, null, reasons.NOT_FOUND);
        }

        // 检查user是否锁定
        if (user.isLocked) {
            // 递增尝试次数
            return user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        // 验证密码
        user.comparePassword(password, function(err, isMatch) {
            if (err) return cb(err);

            // 检查密码是否一致
            if (isMatch) {
                // 若尝试次数为0且没有lockUtil时间戳，直接返回user
                if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
                // 重置loginAttempts和lockUntil
                var updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                };
                return user.update(updates, function(err) {
                    if (err) return cb(err);
                    return cb(null, user);
                });
            }

            // 密码匹配，递增尝试次数
            user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });
});

module.exports = mongodb.mongoose.model('User', UserSchema);