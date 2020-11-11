const http = require('http');
const path = require('path');
const Image = require('./images');
const Koa = require('koa');
const fs = require('fs');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const cors = require('@koa/cors');
const app = new Koa();


const public = path.join(__dirname, '/public');
app.use(cors());
app.use(koaStatic(public));

// => Body Parsers
app.use(koaBody({
    urlencoded: true,
    multipart: true,
    text: true,
    json: true,
}));

app.use(async (ctx) => {
    const { method } = ctx.request;
    switch (method) {
        case "GET":
            switch (ctx.request.query.method) {
                case 'allImages':
                    console.log('get images list');
                    const image = new Image();
                    ctx.response.body = await image.getAll();
                    ctx.response.status = 200;
                    break;
                case 'image':
                    console.log('get image source');
                    ctx.response.status = 200;
                    ctx.response.body = fs.createReadStream(path.join(__dirname, 'public', ctx.request.query.id));
                    break;
            }
            break;
        case "POST":
            if (ctx.request.query.method === "removeImage") {
                console.log('delete image');
                const image = new Image();
                await image.delete(ctx.request.query.id);
                ctx.response.body = 'deleted';
                ctx.response.status = 204;
                return;
            } else {
                console.log('save images');
                const imagePost = new Image(
                    ctx.request.files['files[]'],
                );

                const response = await imagePost.save();

                ctx.response.body = response;
                ctx.response.status = 200;

                return;
            }
        default:
            ctx.response.status = 404;
            return;
    }
});


const port = process.env.PORT || 7070;
http.createServer(app.callback()).listen(port);