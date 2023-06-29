import React from "react";
import styled from "styled-components";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import defaultImg from "../assets/img/2.jpg";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { RiEmotionHappyLine } from "@react-icons/all-files/ri/RiEmotionHappyLine";

function Card({ user }) {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };

  if (!user || !user.photoList || user.photoList.length === 0) {
    // photoList가 비어있을 때 기본 이미지
    return (
      <CardDesign>
        <SliderWrapper>
          <Styled_Slide>
            <CardProfileImg
              onClick={() => {
                if (isLoggedIn) {
                  navigate(`/page/${user.userId}`);
                } else {
                  Swal.fire({
                    icon: "warning",
                    title: "회원 전용 서비스!",
                    text: `더 많은 서비스를 이용하시려면 로그인해주세요🙏`,
                    confirmButtonText: "확인",
                  });
                }
              }}
              src={defaultImg}
            />
          </Styled_Slide>
        </SliderWrapper>
        <CardHeader
          onClick={() => {
            if (isLoggedIn) {
              navigate(`/page/${user.userId}`);
            } else {
              Swal.fire({
                icon: "warning",
                title: "회원 전용 서비스!",
                text: `더 많은 서비스를 이용하시려면 로그인해주세요🙏`,
                confirmButtonText: "확인",
              });
            }
          }}
        >
          <ProfileImg alt="프로필 이미지" src={user.profileUrl}></ProfileImg>
          <FlexWrap>
            <UserNickName>{user.nickName}</UserNickName>
            <UserPosition>
              <RiEmotionHappyLine />
              <UserPositionText>{user.totalLoveCnt}</UserPositionText>
            </UserPosition>
          </FlexWrap>
        </CardHeader>
      </CardDesign>
    );
  }
  return (
    <CardDesign>
      <SliderWrapper>
        <Styled_Slide {...settings}>
          {user.photoList.map((item) => (
            <CardProfileImg
              key={item.photoUrl}
              src={item.photoUrl}
              onClick={() => {
                if (isLoggedIn) {
                  navigate(`/page/${user.userId}`);
                } else {
                  Swal.fire({
                    icon: "warning",
                    title: "회원 전용 서비스!",
                    text: `더 많은 서비스를 이용하시려면 로그인해주세요🙏`,
                    confirmButtonText: "확인",
                  });
                }
              }}
            />
          ))}
        </Styled_Slide>
      </SliderWrapper>
      <CardHeader
        onClick={() => {
          if (isLoggedIn) {
            navigate(`/page/${user.userId}`);
          } else {
            Swal.fire({
              icon: "warning",
              title: "회원 전용 서비스!",
              text: `더 많은 서비스를 이용하시려면 로그인해주세요🙏`,
              confirmButtonText: "확인",
            });
          }
        }}
      >
        <ProfileImg src={user.profileUrl}></ProfileImg>
        <FlexWrap>
          <UserNickName>{user.nickName}</UserNickName>
          <UserPosition>
            <RiEmotionHappyLine />
            <UserPositionText>
              {user.totalLoveCnt || user.loveCnt}
            </UserPositionText>
          </UserPosition>
        </FlexWrap>
      </CardHeader>
    </CardDesign>
  );
}

export default Card;

const UserPosition = styled.div`
  display: flex;
  align-items: center;
`;

const UserPositionText = styled.span`
  font-size: 16px;
  margin-left: 5px;
`;

const Styled_Slide = styled(Slider)`
  position: relative;
  opacity: 100%;
  border: none;
  z-index: 1;
  .slick-prev,
  .slick-next {
    display: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 11;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 50%;
    font-size: 20px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .slick-prev {
    left: 3px;
  }
  .slick-next {
    right: 3px;
  }
  &:hover {
    .slick-prev,
    .slick-next {
      opacity: 0.8;
    }
  }
`;

const CardDesign = styled.div`
  color: black;
  border-radius: 5px;
  flex-grow: 1;
  cursor: pointer;
  width: 100%;
  width: calc(25% - 20px);

  @media (max-width: 1024px) {
    width: calc(50% - 20px);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
  &:hover {
    transform: translateY(-10px);
    transition: transform 1s ease;
    cursor: pointer;
  }

  &:not(:hover) {
    transform: translateY(0);
    transition: transform 1s ease;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;
const ProfileImg = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  padding: 10px;
  flex-shrink: 0;
  @media (max-width: 1024px) {
    width: 45px;
    height: 45px;
  }
`;

const FlexWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
`;

const UserNickName = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: black;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
`;

const SliderWrapper = styled.div`
  position: relative;
  background-color: #fff;
`;

const CardProfileImg = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12.69px;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-color: ${(props) => (props.src ? "transparent" : "#583232")};
  background-image: ${(props) =>
    props.src ? `url(${props.src})` : `url(${defaultImg})`};
`;

const ArrowButton = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
`;

const PrevArrow = ({ onClick }) => (
  <ArrowButton className="slick-prev" onClick={onClick}></ArrowButton>
);

const NextArrow = ({ onClick }) => (
  <ArrowButton className="slick-next" onClick={onClick}></ArrowButton>
);
