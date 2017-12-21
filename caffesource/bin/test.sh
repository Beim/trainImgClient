#!/bin/bash

caffe test -model model/train_val.prototxt -weights snapshot/bvlc_googlenet_iter_4000.caffemodel -gpu 0 -iterations 100
