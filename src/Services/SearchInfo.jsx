import { useState, useEffect } from 'react';
import { fetchPictures } from './PixabayApi';

import Searchbar from '../components/Searchbar';
import ImageGallery from '../components/ImageGallery';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Notify } from 'notiflix';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import  ErrorImg from '../components/ErrorImg'
 import img from 'components/images/Best-Coming-Soon-and-404-Error-Page-Templates-for-Your-Unique-Websites.jpg';

const Status = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

const SearchInfo = () => {
  const [pictures, setPictures] = useState([]);
  const [largeImage, setLargeImage] = useState('');
  const [tags, setTags] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState(Status.IDLE);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [isError, satIsError] = useState(false);
  useEffect(() => {
    if (query) {
      satIsError(false);
      setStatus(Status.PENDING);
      fetchPictures(query, page)
        .then(pictures => {  
          
          if (pictures.totalHits === 0 && pictures.hits.length === 0) {
             satIsError(true );
            Notify.failure(
              'Sorry, there are no images matching your search query. Please try again.'
            );
          }
          if (pictures.hits.length === 0 && pictures.totalHits !== 0) {
            Notify.info(
              "We're sorry, but you've reached the end of search results."
            );
          }

          if (
            page === 1 &&
            pictures.totalHits !== 0 &&
            pictures.hits.length !== 0
          ) {
            Notify.success(`Hooray! We found ${pictures.totalHits} images.`);
          } 

          setPictures(state => [...state, ...pictures.hits]);
          setStatus(Status.RESOLVED);
        })
        .catch(() => {
          Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
        })
        .finally(() => {
          if (page > 1) {
            setTimeout(smoothScroll, 250);
          }
        });
    }
  }, [query, page]);

  const incrementPage = () => {
    setPage(state => state + 1);
  };

  const handleFormSubmit = query => {
    setPage(1);
    setPictures([]);
    setQuery(query);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const smoothScroll = () => {
    let scrollHeight = document.documentElement.scrollHeight;

    window.scrollTo({
      top: scrollHeight,
      behavior: 'smooth',
    });
  };

  const setInfoForModal = (url, tags) => {
    setLargeImage(url);
    setTags(tags);

    toggleModal();
  };
      if (isError === true) {
      return (
        <>
          {Loading.remove()} 
          <Searchbar onSubmit={handleFormSubmit} />
          <ErrorImg errorImg={img} />
        
        </>);
    }

  if (status === Status.IDLE) {
    return <Searchbar onSubmit={handleFormSubmit} />;
  }

  if (status === Status.PENDING) {
    return (
      <>
        {Loading.pulse({
          svgSize: '150px',
        })}
        <Searchbar onSubmit={handleFormSubmit} />;      
      </>
    );
  }

  if (status === Status.RESOLVED) {
    return (
      <>
        {Loading.remove()}
        <Searchbar onSubmit={handleFormSubmit} />;
        <main>
          <ImageGallery pictures={pictures} setInfoForModal={setInfoForModal} />
          {showModal && (
            <Modal onClose={toggleModal} largeImage={largeImage} tags={tags} />
          )}
            {pictures.length > 0 && pictures.length/page===12&&
          (
            <Button incrementPage={incrementPage} />
          )}
        </main>
      </>
    );
  }
};

export default SearchInfo;
