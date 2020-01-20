import path from 'path'

export function serve(req, res) {
    // import Bundler  from 'parcel-bundler'
    // const cacheDir = path.resolve(__dirname, '../lib/.cache')
    // const outDir = path.resolve(__dirname, '../lib/store')
    // const bundlerOptions = { production: process.env.NODE_ENV === 'production', outDir, cacheDir }
    // const srcDir = path.resolve(__dirname, 'store/index.js')
    // const bundler = new Bundler(srcDir, bundlerOptions )
    // const middleware = bundler.middleware()
    // const result = middleware(req,res)
    // return result
    res.sendFile(req.url, {root: path.resolve(__dirname, '../lib/store')})
}