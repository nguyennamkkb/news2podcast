import { Composition } from 'remotion';
import { NewsSlide } from './components/NewsSlide';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TestSlide"
        component={NewsSlide}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: 'TIN TỨC HÔM NAY',
          bullets: [
            'Thị trường chứng khoán tăng điểm',
            'Giá vàng lập đỉnh mới',
            'Công nghệ AI tạo đột phá',
          ],
        }}
      />
    </>
  );
};