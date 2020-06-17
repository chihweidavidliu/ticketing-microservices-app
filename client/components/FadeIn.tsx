import styled from "styled-components";

interface IFadeInProps {
  duration?: number;
}

export const FadeIn = styled.div<IFadeInProps>`
  animation: fadeIn ${(props) => props.duration || 0.5}s;

  @keyframes fadeIn {
    from {
      transform: scale(0.2);
      opacity: 0;
    }

    to {
      top: 25%;
      opacity: 1;
    }
  }
`;
