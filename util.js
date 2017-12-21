const fs = require('fs')
const path = require('path')
const child_process = require('child_process')

const ROOT_DIR = path.join(__dirname, 'caffesource')
const IMG_PATH = path.join(ROOT_DIR, 'rawimgs/images')
const TRAIN_TXT_PATH = path.join(ROOT_DIR, 'rawimgs/train.txt')
const TEST_TXT_PATH = path.join(ROOT_DIR, 'rawimgs/val.txt')
const LMDB_DIR = path.join(ROOT_DIR, 'lmdbimgs')

const genLabels = () => {
    const label_names = fs.readdirSync(IMG_PATH)
    const train_txt_fd = fs.openSync(TRAIN_TXT_PATH, 'w')
    const test_txt_fd = fs.openSync(TEST_TXT_PATH, 'w')
    for (let label of label_names) {
        const img_names = fs.readdirSync(path.join(IMG_PATH, label))
        for (let j in img_names) {
            const img = img_names[j]
            const p = path.join(IMG_PATH, label, img) + ` ${label}\n`
            if (j % 5 !== 0) {
                fs.writeSync(train_txt_fd, p)
            }
            else {
                fs.writeSync(test_txt_fd, p)
            }
        }
    }
    fs.closeSync(train_txt_fd)
    fs.closeSync(test_txt_fd)
}

const convImgs2Lmdb = () => {
    child_process.execSync(`rm -rf ${LMDB_DIR}/*`)
    const CONVERT_TOOL = path.join(ROOT_DIR, 'rawimgs/create_imgs_lmdb.sh')
    child_process.execSync(`"${CONVERT_TOOL}" ${TRAIN_TXT_PATH} ${TEST_TXT_PATH} ${LMDB_DIR}`)
}
