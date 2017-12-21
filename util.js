const fs = require('fs')
const path = require('path')

const genLabels = () => {
    IMG_DIR = 'caffesource/rawimages/images'
    names = fs.readdirSync(path.join(__dirname, IMG_DIR))
    console.log(names)
}

const convImgs2Lmdb = () => {

}
