#!/usr/bin/env sh
/opt/caffe/build/tools/caffe train --solver=../model/solver.prototxt $@ > /dev/null 2> output &
