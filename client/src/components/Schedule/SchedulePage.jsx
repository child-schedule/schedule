import { useParams } from 'react-router-dom';

function SchedulePage() {
  const { date } = useParams();

  return (
    <main>
      <h1>Schedule for {date}</h1>
      <p>Schedule grid placeholder — built in Layers 8–9.</p>
    </main>
  );
}

export default SchedulePage;
