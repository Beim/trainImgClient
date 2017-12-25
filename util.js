const fs = require('fs')
const path = require('path')
const child_process = require('child_process')

const ROOT_DIR = path.join(__dirname, 'caffesource')
const IMG_PATH = path.join(ROOT_DIR, 'rawimgs/images')
const TRAIN_TXT_PATH = path.join(ROOT_DIR, 'rawimgs/train.txt')
const TEST_TXT_PATH = path.join(ROOT_DIR, 'rawimgs/val.txt')
const LMDB_DIR = path.join(ROOT_DIR, 'lmdbimgs')

class Solver {

    constructor() {
        this.recover()
        this.sync()
        this.MAX_ITER = 2000
        this.BASE_LR = 0.001
    }

    recover() {
        this.losses = []
        this.config = {
            net: "model/train_val.prototxt",
            test_iter: 1000,
            test_interval: 4000,
            test_initialization: "false",
            display: 100,
            average_loss: 40,
            base_lr: 0.01, // 学习率
            lr_policy: "step",
            stepsize: 320000,
            gamma: 0.96,
            max_iter: 2000, // 最大循环
            momentum: 0.9,
            weight_decay: 0.0002,
            snapshot: 200,
            snapshot_prefix: "snapshot/bvlc_googlenet",
            solver_mode: 'GPU',
        }
    }

    autoAdjustConfig() {
        let losses_len = this.losses.length
        if (losses_len > 2 && this.losses[losses_len - 1] > 10 * this.losses[losses_len - 2]) {
            this.reduceLr()
        } 
        else if (this.config.max_iter < this.MAX_ITER) {
            this.increaseIter()
            return true
        }
        else if (this.config.base_lr > this.BASE_LR) {
            this.reduceLr()
            return true
        }
        else {
            return false
        }
    }

    reduceLr() {
        this.config.base_lr /= 2
        this.sync()
    }

    increaseIter() {
        this.config.max_iter *= 2
        this.sync()
    }

    update(new_config={}) {
        Object.assign(this.config, new_config)
        this.sync()
    }

    // 同步配置到model/solver.prototxt
    sync() {
        let solver_prototxt = ''
        for (let key in this.config) {
            let value = this.config[key]
            if (['net', 'lr_policy', 'snapshot_prefix'].includes(key)) {
                solver_prototxt += `${key}: "${value}"\n`
            }
            else {
                solver_prototxt += `${key}: ${value}\n`
            }
        }
        fs.writeFileSync(path.join(ROOT_DIR, 'model/solver.prototxt'), solver_prototxt)
    }

}

class Caffe {

    constructor() {
        this.genLabels()
        this.convImgs2Lmdb()
    }

    genLabels() {
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
    
    convImgs2Lmdb() {
        child_process.execSync(`rm -rf ${LMDB_DIR}/*`)
        const CONVERT_TOOL = path.join(ROOT_DIR, 'rawimgs/create_imgs_lmdb.sh')
        child_process.execSync(`"${CONVERT_TOOL}" ${TRAIN_TXT_PATH} ${TEST_TXT_PATH} ${LMDB_DIR} 2> /dev/null`)
    }

    clear() {
        child_process.execSync(`rm ${TRAIN_TXT_PATH}`)
        child_process.execSync(`rm ${TEST_TXT_PATH}`)
        child_process.execSync(`rm ${ROOT_DIR}/snapshot/*.caffemodel`)
    }

    trainModelAsync(solver) {
        solver.sync()
        return new Promise((resolve, reject) => {
            const CAFFE_TOOL = '/opt/caffe/build/tools/caffe'
            const SOLVER_PATH = path.join(ROOT_DIR, 'model/solver.prototxt')
            const sub_proc = child_process.spawn(CAFFE_TOOL, ['train', `--solver=${SOLVER_PATH}`], {'cwd': ROOT_DIR})
            sub_proc.stderr.on('data', (data) => {
                // console.log('stderr: ')
                // console.log(data.toString())
            })
            sub_proc.on('close', (code) => {
                // console.log('trainModel.code: ', code)
                resolve(code === 0 ? 0 : -1)
            })
            sub_proc.on('error', (err) => {
                reject(err)
            })
        })
    }

    testModelAsync(solver) {
        let loss = -1
        return new Promise((resolve, reject) => {
            const CAFFE_TOOL = '/opt/caffe/build/tools/caffe'
            const MODEL_PATH = path.join(ROOT_DIR, 'model/train_val.prototxt')
            const CAFFEMODEL_PATH = path.join(ROOT_DIR, `snapshot/bvlc_googlenet_iter_${solver.config.max_iter}.caffemodel`)
            const sub_proc = child_process.spawn(CAFFE_TOOL, ['test', '-model', MODEL_PATH, '-weights', CAFFEMODEL_PATH, '-gpu', '0', '-iterations', '100'], {'cwd': ROOT_DIR})
            const reg = new RegExp('.*Loss: (.*)\n')
            sub_proc.stderr.on('data', (data) => {
                data = data.toString()
                let result = data.match(reg)
                if (result) {
                    loss = parseFloat(result[1])
                }
            })
            sub_proc.on('close', (code) => {
                // console.log('testModel.code: ', code)
                console.log('loss: ', loss)
                this.losses.push(loss)
                resolve(code === 0 ? loss : -1)
                
            })
            sub_proc.on('error', (err) => {
                reject(err)
            })
        })
    }
}

module.exports = {
    Solver,
    Caffe,
}


