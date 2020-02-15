import path from 'path'

export function serve(req, res) {
    res.sendFile(req.url, {root: path.resolve(__dirname, '../lib/ui')})
}