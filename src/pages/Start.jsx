import React from "react";
import styled from "styled-components";
import InitialNav from "../components/InitialNav";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { initialMain } from "../apis/main/initialMain";
import LoadingSpinner from "../components/LoadingSpinner";
import start1 from "../assets/img/Rectangle 312.png";
import start2 from "../assets/img/Rectangle 313.png";
import start3 from "../assets/img/Rectangle 243.png";
import start4 from "../assets/img/Rectangle 307.png";
import start5 from "../assets/img/Rectangle 308.png";
import start6 from "../assets/img/Rectangle 309.png";
import start7 from "../assets/img/Rectangle 310.png";
import start8 from "../assets/img/Rectangle 311.png";

function Start() {
  const navigate = useNavigate();
  const { isLoading, isError, data } = useQuery("initialMain", initialMain);
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (isError) {
    return <h1>{isError}</h1>;
  }
  const img1 = [start1, start2];
  const img2 = [start3, start4];
  const img3 = [start5, start6];
  const img4 = [start7, start8];

  return (
    <PageContainer>
      <NavigationBar>
        <InitialNav />
      </NavigationBar>
      <ContentContainer>
        <ImageContainer1>
          {img1.map((image) => (
            <PostImage key={image} src={image} />
          ))}
        </ImageContainer1>

        <DescriptionContainer>
          <DesTitle>당신의 모든 순간 모먼트와 함께</DesTitle>
          <Des>모델과 사진작가 매칭 플랫폼</Des>
          <StartButton
            onClick={() => {
              navigate("/Main");
            }}
          >
            지금 시작하기
          </StartButton>
        </DescriptionContainer>

        <ImageContainer2>
          {img2.map((image) => (
            <PostImage key={image} src={image} />
          ))}
        </ImageContainer2>
        <ImageContainer3>
          {img3.map((image) => (
            <PostImage key={image} src={image} />
          ))}
        </ImageContainer3>
        <ImageContainer4>
          {img4.map((image) => (
            <PostImage key={image} src={image} />
          ))}
        </ImageContainer4>
      </ContentContainer>
    </PageContainer>
  );
}

export default Start;

const PageContainer = styled.div`
  width: 100%;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NavigationBar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
`;

const DesTitle = styled.p`
  font-family: "LINESeedKR-Bd";
  word-break: keep-all;
`;

const Des = styled.p`
  font-family: "LINESeedKR-Bd";
  margin-top: 20px;
  font-size: 65px;
  word-break: keep-all;
  /* font-weight: 400; */
  color: #2f2f2f;
  @media (max-width: 1470px) {
    font-size: 33px;
    width: 260px;
  }
`;

const StartButton = styled.button`
  border: none;
  width: 190px;
  height: 78px;
  border-radius: 10px;
  background-color: #483767;
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-top: 60px;
  box-shadow: 2px 2px 2px gray;
  @media (max-width: 480px) {
    width: 140px;
    height: 56px;
    font-size: 16px;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: calc(100vh - 60px);
  overflow: hidden;
  flex-direction: row;
  justify-content: space-between;
`;

const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0 100px;
  flex-basis: 50%;
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  /* text-shadow: 1px 1px 1px gray; */
  @media (max-width: 1565px) {
    margin: 0 90px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-basis: 100%;
    font-size: 24px;
  }
  @media (max-width: 480px) {
    margin: 0 70px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-basis: 100%;
    font-size: 24px;
  }
`;
const ImageContainer1 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
  justify-content: flex-start;
  padding-bottom: 100px;
  img {
    filter: brightness(60%);
    height: 480px;
  }
`;

const ImageContainer2 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
  padding-top: 200px;
  margin-right: 20px;
  img {
    width: 306px;
    height: 480px;
  }
`;

const ImageContainer3 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
  padding-top: 100px;
  margin-right: 20px;
  img {
    width: 306px;
    height: 480px;
  }
`;

const ImageContainer4 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
  padding-bottom: 40px;
  img {
    filter: brightness(60%);
    height: 480px;
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: auto;
  max-width: 306px;
  max-height: 480px;
`;
