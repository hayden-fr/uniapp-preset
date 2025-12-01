<script setup lang="ts">
onLaunch(() => {})

onShow(() => {})

onHide(() => {})
</script>

<style>
/* #ifdef H5 */
.uni-toast {
  top: 40%;
  background: #4c4c4c;
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
