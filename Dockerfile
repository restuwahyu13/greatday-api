######################
# START STAGE 1
######################
FROM node:16.20.2-alpine as start
USER ${USER}
ADD ./package.*json ./
ADD . ./

#######################
# FINAL STAGE 2
#######################
FROM start as final
WORKDIR /usr/src/app
COPY --from=start . /usr/src/app
RUN rm -rf node_modules \
  && npm cache clean -f \
  && npm config delete proxy \
  && npm config delete https-proxy \
  && npm config set fetch-retry-mintimeout 6000000 \
  && npm config set fetch-retry-maxtimeout 12000000 \
  && npm config set fetch-timeout 30000000 \
  && npm i --loglevel verbose --no-audit \
  && npm run build \
  && mkdir images
EXPOSE 3000
CMD npm start
