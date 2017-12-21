import os
from random import shuffle

path = 'images/'
names = os.listdir(path)

train_txt = open('train.txt', 'w')
test_txt = open('val.txt', 'w')

for i in range(len(names)):
    print 'names %s' % i
    imgs = os.listdir(path + names[i])
    shuffle(imgs)
    for j in range(len(imgs)):
        p = path + names[i] + '/' + imgs[j] + ' ' + names[i] + '\n'
        if (j % 5 != 0):
            train_txt.writelines(p)
        else:
            test_txt.writelines(p)

train_txt.close()
test_txt.close()
