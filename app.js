const butil = require('./util.js')

solver = new butil.Solver()
caffe = new butil.Caffe()

const test = async () => {
    let loss = 1000
    while (loss > 1) {
        if (solver.config.max_iter < 2000) {
            solver.increaseIter()
        }
        else if (solver.config.base_lr > 0.001) {
            solver.reduceLr()
        }
        
        console.log('iter: ', solver.config.max_iter, ' lr: ', solver.config.base_lr)
        await caffe.trainModelAsync(solver)
        loss = await caffe.testModelAsync(solver)
    }
    console.log('test: ', loss)
}

solver.update({max_iter: 10})
test()
// caffe.clear()