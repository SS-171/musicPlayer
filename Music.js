const $ =document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY ="mode"
const player=$('.player');
const volumeSet=$('#volumeAdjust')
const volumeIcon=$('.volume .btn-volume')
const allSongs=$$('.song');
const activeSong=$('.song.active');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb =$('.cd-thumb');
const repeatBtn = $('.btn-repeat');
const prevBtn = $('.btn-prev');
const playBtn = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const progress= $('#progress');
const audio = $('#audio');
const playlist = $('.playlist');
const endTime=$('.endTime');
const rangeValue=$('.rangeValue');
const app={
    currentIndex: 0,
    isPlaying :false,
    isNext :false,
    isRandom: false,
    isTimeUpdate: true,
    isRepeat :false,
    songTime:0,
    songVolume:0,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY ))||{},
    songs: [
        {
            name: 'BadHabits' ,
            singer: 'EdSheeran',
            path: './Assets/BadHabit.mp3',
            image: './Assets/iBadHabit.jpg'
        },
        {
            name: 'What are words' ,
            singer: 'Medina',
            path: './Assets/What are words.mp3',
            image: './Assets/words.jpg'
        },
        {
            name: 'HienNha' ,
            singer: 'No name',
            path: './Assets/HienNha.mp3',
            image: './Assets/ihiennha.jfif'
        },
        {
            name: 'LeaveTheDoorOpen' ,
            singer: 'BrunoMars',
            path: './Assets/LeaveTheDoorOpen.mp3',
            image: './Assets/Leave.jpg'
        },
        {
            name: 'ToTheMoon' ,
            singer: 'Hooligan',
            path: './Assets/Tothemoon.mp3',
            image: './Assets/Moon.jpg'
        },
        {
            name: 'Love You Baby' ,
            singer: 'Sinastra',
            path: './Assets/LoveYouBaby.mp3',
            image: './Assets/Love.jpg'
        }
        
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    renderSong: function(){
        const htmls =this.songs.map((song,index)=>{
            return `
            <div class="song ${this.currentIndex===index?'active':''}" data-index=${index}>
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author"${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `
        });

        playlist.innerHTML=htmls.join('');
 
    },
    defineProperties: function(){
        Object.defineProperty(this,'currentSong',{
        get: function(){
            return this.songs[this.currentIndex];
        }
    }
        )
    },
    handleEvents: function(){
        const _this=this; 
        const cdWidth = cd.offsetWidth;
        const cdThumbAnimate =cdThumb.animate([
            {transform:'rotate(360deg)'}
        ],
        {
            iterations:Infinity,
            duration:10000
        });
        cdThumbAnimate.pause();
        document.onscroll = function(){
            const scrollTop = window.scrollY||document.documentElement.scrollTop
            const newWidth = cdWidth -scrollTop;
            cd.style.width = newWidth>0?newWidth +"px":0;
            cd.style.opacity = newWidth/cdWidth;
        };     
     //Listen Button Control event  
        playBtn.onclick = function(){
            if(_this.isPlaying) {
                audio.pause();
                }
            else {
                audio.play();
                }
            };

        //Next song on
        nextBtn.onclick =function(){
            autoNextSong();
            _this.scrollToActiveSong();
            
        }
        //Previous song on
        prevBtn.onclick =function(){
            if(_this.isRandom){
                _this.randomMode();
            }
            else {
                _this.prevSong();
            }
            audio.play();
            _this.scrollToActiveSong();
        };
        
        //Random on
        randomBtn.onclick =function(){
            _this.isRandom=!_this.isRandom;
            _this.setConfig('isRandom',_this.isRandom);
            randomBtn.classList.toggle('active',_this.isRandom);
        };
        //Repeat on
        repeatBtn.onclick =function(){
            _this.isRepeat=!_this.isRepeat;
            _this.setConfig('isRepeat',_this.isRepeat);
            repeatBtn.classList.toggle('active',_this.isRepeat);
        }
        //Auto play next song
        const autoNextSong=()=>{
                if(_this.isRandom)
                     {
                        _this.randomMode();
                    }
                else this.nextSong();
                audio.play();}
        //Handle audio element
        //Load duration instantly 
        audio.onloadeddata = function(){
                _this.songTime=audio.duration.toFixed();
                // _this.songVolume=audio.volume*100; 
                var second=_this.songTime%60;
                endTime.innerHTML =`0${Math.floor(_this.songTime/60)}:${second>9?second:'0'+second}`;
        }
        audio.onplay =function(){
            _this.isPlaying = true;        
            player.classList.add('playing');
            cdThumbAnimate.play();
        };
        audio.onpause =function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        };
        audio.ontimeupdate =function(){
                if(audio.duration)
                {
                    const currentProgress =Math.floor(audio.currentTime/audio.duration*100);
                    progress.value = currentProgress;
                    const currentMinute = Math.floor(audio.currentTime/60);
                    const currentSecond =Math.floor(audio.currentTime%60)
                    rangeValue.innerHTML =`0${currentMinute}:${currentSecond>9?currentSecond:'0'+currentSecond}`;
                    rangeValue.style.left =audio.currentTime/audio.duration*89+'%'
                    var color = 'linear-gradient(90deg, rgb(9, 241, 21)' + progress.value + '% , rgb(214, 214, 214)' + progress.value+ '%)';
                    progress.style.background =color;
                }
            };
        audio.onended = function(){
            if(_this.isRepeat) 
            {
                audio.play();
            }
            else
            autoNextSong();
        }
        progress.oninput =function(e){
                var x=0;
                x=e.target.value;
                const seekTime = x/100*audio.duration;
                audio.currentTime = seekTime;
                
        };
        progress.onkeydown= function(e){
            if(e.keyCode===39)
            {
                progress.value ++;
            }
        };
        //Song active at playist
        playlist.onclick= function(e){
            const songNode=e.target.closest('.song:not(.active)');
            const option=e.target.closest('.option');
            if(songNode||option)
            {
                if(songNode){
                    const index=songNode.getAttribute('data-index')
                    _this.currentIndex=Number(index);
                    _this.loadAndSave();
                    audio.play();
                }
                if(option){

                }
            }
        };
        //Volume adjustment
        volumeSet.oninput= function(e){
            _this.songVolume=e.target.value;
            audio.volume=_this.songVolume/100;
            var volumeColor='linear-gradient(90deg, rgb(75, 36, 173)' +_this.songVolume+'%, rgb(214, 214, 214) '+_this.songVolume+'%)';
            volumeSet.style.background=volumeColor;
            _this.setConfig("volume",_this.songVolume);
            _this.volumeIconHandle();   
        };

        ///key and mouse handle
        nextBtn.onmousedown = function(){
            nextBtn.classList.add('active');
        };
        nextBtn.onmouseup = function(){
            nextBtn.classList.remove('active');
        };
        prevBtn.onmousedown = function(){
            prevBtn.classList.add('active');
        };
        prevBtn.onmouseup = function(){
            prevBtn.classList.remove('active');
        };

            
        //progress.addEventListener('input',function(){

        //})
        

    },
    loadCurrentSong: function(){
        heading.textContent =this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src =this.currentSong.path;
        
    },
    loadAndSave: function(){
        this.setConfig("currentIndex",this.currentIndex);
        this.loadCurrentSong();
        this.renderSong();
    },
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex>=this.songs.length) 
        {
            this.currentIndex=0;
        }
        this.loadAndSave();

    },
    prevSong: function(){
        this.currentIndex -=1;
        if(this.currentIndex<0) 
        {
            this.currentIndex=this.songs.length-1;
        }
        this.loadAndSave();
    },
    randomMode: function(){
        let newIndex;
        do {
            newIndex=Math.floor(Math.random()*this.songs.length)
        }
        while(newIndex===this.currentIndex)
       this.currentIndex=newIndex;
       this.loadAndSave();
    },
    scrollToActiveSong: function(){
        var view='';
        if(this.currentIndex<2) view='end';
        else view='nearest';
        setTimeout(() => {
            $('.song.active').scrollIntoView({
              behavior: "smooth",
              block: view
            });
          }, 300);
        
    },
    volumeIconHandle: function(){
        const volume=this.songVolume;  
        if(volume>50) volumeIcon.innerHTML='<i class="fas fa-volume-up"></i>'
        else {
            if(volume>=5&&volume<=50) volumeIcon.innerHTML='<i class="fas fa-volume-down"></i>'
            else volumeIcon.innerHTML='<i class="fas fa-volume-mute"></i>'
        }     
        
    },
    volumeLoad: function(){
        ///Volume 
        this.songVolume=this.config.volume;
        volumeSet.value=this.songVolume;
        var volumeColor='linear-gradient(90deg, rgb(75, 36, 173)' +this.songVolume+'%, rgb(214, 214, 214) '+this.songVolume+'%)';
        volumeSet.style.background=volumeColor;   
        //Icon
        this.volumeIconHandle();
       
    },
    savingConfig: function(){
        this.isRandom=this.config.isRandom;
        this.isRepeat=this.config.isRepeat;
        randomBtn.classList.toggle('active',this.isRandom);
        repeatBtn.classList.toggle('active',this.isRepeat);
    },
    start: function(){
        this.savingConfig();
        this.volumeLoad();
        this.currentIndex = this.config.currentIndex;
        this.defineProperties();
        this.loadAndSave();
        this.handleEvents();
             
    }
}
document.addEventListener("DOMContentLoaded", app.start());