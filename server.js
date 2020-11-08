const http = require('http');
const path = require('path');
const Image = require('./images');
const Koa = require('koa');
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
            if (ctx.request.query.method === "allImages") {
                ctx.response.body = await Image.getAll();
                ctx.response.status = 200;
            } else if (ctx.request.query.method === "imageById") {
                const imageId = await Image.getById(ctx.request.query.id);
                ctx.response.body = imageId;
            }
            break;
        case "POST":
            if (ctx.request.query.method === "removeImage") {
                await Image.delete(ctx.request.query.id);

                ctx.response.body = 'deleted';
                ctx.response.status = 204;
                return;
            } else {
                const imagePost = new Image(
                    ctx.request.body.url,
                );
                await imagePost.save();
                ctx.response.body = imagePost;
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