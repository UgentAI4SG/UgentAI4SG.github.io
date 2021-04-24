#!/bin/bash

kill -9 $(ps | grep http.server | awk '{print $1; exit;}')
