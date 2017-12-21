const fs = require('fs')
const path = require('path')

const genLabels = () => {
    ROOT_DIR = path.join(__dirname, 'caffesource/rawimgs')
    IMG_PATH = path.join(ROOT_DIR, 'images')
    TRAIN_TXT_PATH = path.join(ROOT_DIR, 'train1.txt')
    TEST_TXT_PATH = path.join(ROOT_DIR, 'val1.txt')

    label_names = fs.readdirSync(IMG_PATH)
    train_txt_fd = fs.open(TRAIN_TXT_PATH, 'w')
    test_txt_fd = fs.open(TEST_TXT_PATH, 'w')
    for (let label of label_names) {
        img_names = fs.readdirSync(path.join(IMG_PATH, label))
        for (let j in img_names) {
            img = img_names[j]
            img_path = path.join(IMG_PATH, label, img)
            p = path.join(IMG_PATH, label, img) + ` ${label}\n`
            if (j % 5 !== 0) {
                fs.writeSync(train_txt_fd, p)
            }
            else {
                fs.writeSync(test_txt_fd, p)
            }
        }
    }
    fs.close(train_txt_fd)
    fs.close(test_txt_fd)
}


const convImgs2Lmdb = () => {

}
