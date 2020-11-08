const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

class Image {
    constructor(url) {
        this.id = uuidv4();
        this.url = url;
    }

    async save() {
        const images = await Image.getAll();
        images.push(this.toJSON());
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

    toJSON() {
        return {
            url: this.url,
            id: this.id
        }
    }

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

    async getById(id) {
        const images = await Image.getAll();
        return images.find(elem => elem.id === id)
    }

    async delete(id) {
        let images = await Image.getAll();
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