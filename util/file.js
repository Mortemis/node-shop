const fs = require('fs');
exports.deleteFile = async (path) => {
    const promise = new Promise((resolve, reject) => {
        fs.unlink(path, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
    return promise;
}