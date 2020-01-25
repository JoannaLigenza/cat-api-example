import React from "react";

const STATUS_FETCHING = "fetching";
const STATUS_LOADED = "loaded";

export default class Gallery extends React.Component {
  state = {
      loadingState: null,
      images: [],
      page: 0,
      loadLimit: 10,
      limitImagesOnPage: 1000,
      limitImagesOnPageAutoscroll: 110,
      isScrollbarVisible: false,
      isMobile: false,
  };

  componentDidMount() {
    const loadImagesAtStart = () => {
      if (window.innerHeight > document.body.offsetHeight) {
        this.fetchRandomCat();
      } 
      if (window.innerHeight < document.body.offsetHeight) {
        clearInterval(interval);
      }
    }
    const interval = setInterval(loadImagesAtStart, 500);
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.screenWidth);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.screenWidth); 
  }

  handleScroll = () => {
    if ( (window.scrollY + window.innerHeight) >= document.body.offsetHeight - 200 ) {
      if (this.state.loadingState !== STATUS_FETCHING) {
        this.fetchRandomCat();
      } 
    }
    if (!this.state.isScrollbarVisible && window.pageYOffset > 0) {
      this.setState({isScrollbarVisible: true});
    }
  }

  screenWidth = () => {
    if (window.innerWidth < 600 && !this.state.isMobile) {
      this.setState({isMobile: true});
    }
    if (window.innerWidth > 600 && this.state.isMobile) {
      this.setState({isMobile: false});
    }
  }

  // autosSrollToBottom = () => {
  //   this.setState({limitImagesOnPage: this.state.limitImagesOnPageAutoscroll})
  //   const startScrolling = (images = this.loadedImages, limitImages = this.state.limitImagesOnPage) => {
  //     // if scrollbar is not visible, then load more images; if is visible, then scroll to bottom, which fires loadind more images
  //     if (!this.state.isScrollbarVisible) {
  //       this.fetchRandomCat();
  //       // this.loadImages();
  //     } 
  //     window.scrollTo({
  //       top: document.body.offsetHeight - 400,
  //       behavior: 'smooth'
  //     });
  //     // clear interval
  //     if (images >= limitImages) {
  //       clearInterval(interval);
  //       window.scrollTo({
  //         top: document.body.offsetHeight,
  //         behavior: 'smooth'
  //       });
  //     }
  //   }
  //   const interval = setInterval(startScrolling, 1000);
  // }

  fetchRandomCat = () => {
    // console.log('one ', this.state.images)
    if (this.state.images.length > (this.state.limitImagesOnPage) ) {
      return;
    }
    const { loadLimit , page } = this.state;
    this.setState({
      loadingState: STATUS_FETCHING
    });
    fetch(`https://api.thecatapi.com/v1/images/search?limit=${loadLimit}&page=${page}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "4bebae0d-0ec4-4787-8e77-8602741525af"
    }
    })
    .then(data => data.json())
    .then(data => {
      const newImages = [];
      for (let i=0; i < data.length; i++) {
        const { url, id, width, height } = data[i];
        newImages.push([url, id, width, height]);
      }
      this.setState({
        page: this.state.page + 1,
        images: [...this.state.images, ...newImages],
        loadingState: STATUS_LOADED,
      });
    });
    console.log(this.state.images.length)
  };

  render() {
    const displayImages = this.state.images.map( (image, index) => {
      const imgWidth = image[2];
      const imgHeight = image[3];
      let ratio = imgWidth / imgHeight;
      let height = 200;
      let width = Math.round(200 * ratio);
      if (this.state.isMobile) {
        ratio = imgHeight / imgWidth;
        width = 300;
        height = Math.round(300 * ratio);
      };
      return (
        <div className="image-container" key={image[1]+index} style={{width: width, height: height}}>
          <img src={image[0]} alt={"cat-"+image[1]} className="image"/>
        </div>
      )
    });

    return (
      <div className="gallery-container">
        <div className="scroll-to-bottom-button-container">
          <button className="scroll-to-bottom-button" onClick={() => this.autosSrollToBottom()} title='Lazy scroll button is dedicated to my husband - CLT  :)'>Automatically Scroll Gallery</button>
        </div>
        <div className="gallery" ref={ el => this.galleryContainer = el }>
          {displayImages}
        </div>
        <div className="loader-container">
          {this.state.loadingState !== STATUS_LOADED && (
            <div className="loader">Loading...</div>
          )}
        </div>
      </div>
    );
  }
}