<script setup lang="ts">
onLaunch(() => {
  console.log('App Launch')
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>

<style>
/* #ifdef H5 */
.uni-mask {
  z-index: 9999999;
}

.uni-toast {
  top: 40%;
  background: #4c4c4c;
  z-index: 9999999;
}

.uni-toast__icon {
  margin-top: 26px;
  width: 52px !important;
  height: 52px !important;
}

.uni-toast__content {
  font-size: 14px;
  height: 20px;
  padding-left: 6px;
  padding-right: 6px;
}

.uni-toast:has(.uni-toast__icon) .uni-toast__content {
  overflow: hidden;
  margin-bottom: 25px;
}
/* #endif */
</style>
