const butil = require('./util.js')

solver = new butil.Solver()
caffe = new butil.Caffe()

const test = async () => {
    let loss = 1000
    while (loss > 1) {
        solver.increaseIter()
        console.log('iter: ', solver.config.max_iter)
        await caffe.trainModelAsync(solver)
        loss = await caffe.testModelAsync(solver)
    }
    console.log('test: ', loss)
}

solver.update({max_iter: 10})
test()
// caffe.clear()