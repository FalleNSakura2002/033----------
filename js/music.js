var music = document.getElementById("music"); //获取音乐文件
var musicicon = document.getElementById("musicicon"); //获取音乐图标
var action = true; //设置一个变量，用来检测音乐是否在播放。

//一个函数，当用户点击时检测音乐是否在播放，同时执行播放/暂停功能
function musicclick() {
  //action用来检测音乐当前是否在播放。true代表音乐正在播放，false代表音乐已经暂停。
  if (action == false) {
    music.play(); //播放音乐
    action = true;
    document.getElementById("musicicon").style.animationPlayState = "running"; //播放音乐图标
  } else {
    music.pause(); //暂停音乐
    action = false;
    document.getElementById("musicicon").style.animationPlayState = "paused"; //暂停音乐图标
  }
}
