const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

class Image {
    constructor(files) {
        this.files = files;
        this.images = [];
        this.newImages = [];
    }

    //проверяем один файл пришел или несколько
    async save() {
        this.images = await this.getAll()
        if (Array.isArray(this.files)) {
            this.files.forEach((file) => {
                this.saveInPublic(file);
            });
        } else {
            this.saveInPublic(this.files);
        }
        return this.newImages;
    }

    //сохраняем файлы в папку public на сервере
     saveInPublic(file) {
        const filename = uuidv4();
        this.newImages.push({
            name: file.name,
            type: file.type,
            size: file.size,
            id: filename,
        });
        const link = new Promise((resolve, reject) => {
            const oldPath = file.path;
            const newPath = path.join('public', filename);

            const callback = (error) => reject(error);

            const readStream = fs.createReadStream(oldPath);
            const writeStream = fs.createWriteStream(newPath);

            readStream.on('error', callback);
            writeStream.on('error', callback);

            readStream.on('close', () => {
                fs.unlink(oldPath, callback);
                resolve(filename);
            });

            readStream.pipe(writeStream);
        });

        link.then(() => {
            this.saveFile(file, filename);
        })
    }

    //сохраняем файлы в виде массива в db.json на сервере
    async saveFile(file, id) {
        this.images.push(this.toJSON(file, id));
        return  new Promise((resolve, reject) =>{
            fs.writeFile(
                path.join(__dirname, 'public', 'db.json'),
                JSON.stringify(this.images),
                err => {
                    if(err){
                        reject(err)
                    }else{
                        resolve()
                    }
                }
            )
        })
    }

    //формируем объект файла
    toJSON(obj, id = null) {
        return {
            name: obj.name,
            type: obj.type,
            size: obj.size,
            lastModifiedDate: obj.lastModifiedDate,
            id: id ? id : uuidv4(),
        }
    }


    //получем массив со всеми сохраненными элементами
    async getAll() {
        return new Promise((resolve, reject) => {
            fs.readFile(
                path.join(__dirname, 'public', 'db.json'),
                'utf-8',
                (err, content) => {
                    if (err) {
                        reject(err)
                    }else{
                        resolve(JSON.parse(content))
                    }
                }
            )
        })

    }

    // async getById(id) {
    //     const images = await Image.getAll();
    //     return images.find(elem => elem.id === id)
    // }

    async delete(id) {
        fs.unlink(path.join('public', id), function(err) {
            if (err) throw err;
            console.log('file deleted');
        });

        let images = await this.getAll();
        images = images.filter(elem => elem.id !== id);

        return  new Promise((resolve, reject) =>{
            fs.writeFile(
                path.join(__dirname, 'public', 'db.json'),
                JSON.stringify(images),
                err => {
                    if(err){
                        reject(err)
                    }else{
                        resolve()
                    }
                }
            )
        })

    }

}

module.exports = Image;