#!/usr/bin/bash
embe test.mb
mv test.mblock unzip/
cd unzip
unzip test.mblock
mv project.json ..
rm ./**