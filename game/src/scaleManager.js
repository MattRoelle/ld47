class ScaleManager {
    constructor(canvas, isMobile) {
        this.canvas = canvas;
        this.mobile = isMobile;

        window.addEventListener('resize', () => {
            this.resize(this.canvas);

            if (this.mobile) {
                if (window.innerWidth < window.innerHeight) {
                    this.leaveIncorrectOrientation();
                } else {
                    this.enterIncorrectOrientation();
                }
            }
        });

        this.resize(this.canvas);
    }

    resize(canvas) {
        let scale = Math.min(window.innerWidth / canvas.width, window.innerHeight / canvas.height);
        let orientation = 'left';
        let extra = (this.mobile) ? 'margin-left: -50%': '';
        let margin = window.innerWidth / 2 - (canvas.width / 2) * scale;

        canvas.setAttribute('style', '-ms-transform-origin: ' + orientation + ' top; -webkit-transform-origin: ' + orientation + ' top;' +
            ' -moz-transform-origin: ' + orientation + ' top; -o-transform-origin: ' + orientation + ' top; transform-origin: ' + orientation + ' top;' +
            ' -ms-transform: scale(' + scale + '); -webkit-transform: scale3d(' + scale + ', 1);' +
            ' -moz-transform: scale(' + scale + '); -o-transform: scale(' + scale + '); transform: scale(' + scale + ');' +
            ' display: block; margin-left: ' + margin + 'px;'
        );
    }

    enterIncorrectOrientation() {
        document.getElementById("orientation").style.display = "block";
        document.getElementById("content").style.display = "none";
    }

    leaveIncorrectOrientation() {
        document.getElementById("orientation").style.display = "none";
        document.getElementById("content").style.display = "block";
    }
}
export default ScaleManager;