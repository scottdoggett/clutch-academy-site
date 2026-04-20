import GearSection from './components/GearSection'

export default function App() {
  return (
    <main>
      <GearSection gear={1} id="home">
        <h1>1st Gear — Home</h1>
      </GearSection>
      <GearSection gear={2} id="about">
        <h1>2nd Gear — About</h1>
      </GearSection>
      <GearSection gear={3} id="how-it-works">
        <h1>3rd Gear — How It Works</h1>
      </GearSection>
      <GearSection gear={4} id="packages">
        <h1>4th Gear — Packages</h1>
      </GearSection>
      <GearSection gear={5} id="reviews">
        <h1>5th Gear — Reviews</h1>
      </GearSection>
      <GearSection gear={6} id="faq">
        <h1>6th Gear — FAQ</h1>
      </GearSection>
      <GearSection gear="R" id="book">
        <h1>Reverse — Book Now</h1>
      </GearSection>
    </main>
  )
}
