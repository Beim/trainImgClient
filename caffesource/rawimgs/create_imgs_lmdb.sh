#!/bin/bash

TOOLS=/opt/caffe/tools
RESIZE_HEIGHT=224
RESIZE_WIDTH=224
TRAIN_DATA_ROOT=$1
VAL_DATA_ROOT=$1
LABEL_ROOT=$2
LMDB_ROOT=$3

echo "Creating train lmdb ..."

GLOG_logtostderr=1 $TOOLS/convert_imageset \
	--resize_height=$RESIZE_HEIGHT \
	--resize_width=$RESIZE_WIDTH \
	--shuffle \
	$TRAIN_DATA_ROOT/ \
	$LABEL_ROOT/train.txt \
	$LMDB_ROOT/train_lmdb

echo "Creating val lmdb..."

GLOG_logtostderr=1 $TOOLS/convert_imageset \
	--resize_height=$RESIZE_HEIGHT \
	--resize_width=$RESIZE_WIDTH \
	--shuffle \
	$VAL_DATA_ROOT/ \
	$LABEL_ROOT/val.txt \
	$LMDB_ROOT/val_lmdb

echo "Down..."
