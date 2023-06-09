import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
    *{
        margin : 0;
        padding : 0;
        box-sizing: border-box;
        font-family: 'SUITE-Regular';
    }

    a{
        text-decoration: none;
    }

    button{
      outline: none;
        cursor: pointer;
    }

    body{
    -ms-overflow-style: none;
    }
    
    ::-webkit-scrollbar {
    display: none;
    }


    .slick-slider .slick-track,
    .slick-slider .slick-list{
    -webkit-transform: translate3d(0, 0, 0);
    -moz-transform: translate3d(0, 0, 0);
    -ms-transform: translate3d(0, 0, 0);
    -o-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    transition-delay: 10ms;

}

`;
