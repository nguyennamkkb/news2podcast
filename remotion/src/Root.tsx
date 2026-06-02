import { Composition } from 'remotion';
import { NewsSlide } from './components/NewsSlide';
import { NewsVideo } from './compositions/NewsVideo';

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
      <Composition
        id="NewsVideo"
        component={NewsVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          slides: [
            { title: 'Slide 1', bullets: ['Bullet A', 'Bullet B'], voiceover: '', audioPath: '', duration: 3 },
            { title: 'Slide 2', bullets: ['Bullet C'], voiceover: '', audioPath: '', duration: 4 },
          ],
        }}
      />
    </>
  );
};