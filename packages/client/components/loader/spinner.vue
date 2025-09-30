<template>
  <div
    class="spinner"
    :style="{
      '--spin-duration': `${duration}s`,
      '--l20-1-duration': `${duration * 0.6}s`,
      '--l20-2-duration': `${duration * 1.2}s`
    }">
    <div class="loader" />
  </div>
</template>

<script setup lang="ts">
/**
 * Props for the Spinner component
 */
type Props = {
  /** Animation duration in seconds. Defaults to 1 second. */
  duration?: number
}

const { duration = 1 } = defineProps<Props>()
</script>

<style lang="scss" scoped>
.spinner {
  animation: spin var(--spin-duration, 1s) infinite linear;
}

.loader {
  width: 16px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2px solid #514B82;
  animation:
    l20-1 var(--l20-1-duration, 0.6s) infinite linear alternate,
    l20-2 var(--l20-2-duration, 1.2s) infinite linear;
}

@keyframes l20-1{
   0%    {clip-path: polygon(50% 50%,0       0,  50%   0%,  50%    0%, 50%    0%, 50%    0%, 50%    0% )}
   12.5% {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100%   0%, 100%   0%, 100%   0% )}
   25%   {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100% 100%, 100% 100%, 100% 100% )}
   50%   {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100% 100%, 50%  100%, 0%   100% )}
   62.5% {clip-path: polygon(50% 50%,100%    0, 100%   0%,  100%   0%, 100% 100%, 50%  100%, 0%   100% )}
   75%   {clip-path: polygon(50% 50%,100% 100%, 100% 100%,  100% 100%, 100% 100%, 50%  100%, 0%   100% )}
   100%  {clip-path: polygon(50% 50%,50%  100%,  50% 100%,   50% 100%,  50% 100%, 50%  100%, 0%   100% )}
}

@keyframes l20-2{
  0%    {transform:scaleY(1)  rotate(0deg)}
  49.99%{transform:scaleY(1)  rotate(135deg)}
  50%   {transform:scaleY(-1) rotate(0deg)}
  100%  {transform:scaleY(-1) rotate(-135deg)}
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
