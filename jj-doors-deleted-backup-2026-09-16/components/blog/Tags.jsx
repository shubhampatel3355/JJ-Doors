const tags = [
  { id: 1, text: "Teak Wood" },
  { id: 2, text: "Pooja Doors" },
  { id: 3, text: "Veneer Doors" },
  { id: 4, text: "Laminated Doors" },
  { id: 5, text: "WPC Doors" },
  { id: 6, text: "Handcrafted" },
  { id: 7, text: "Vastu Architecture" },
  { id: 8, text: "Main Entrance" },
  { id: 9, text: "Custom Carving" },
];

export default function Tags() {
  return (
    <div className="sidebar__widget">
      <h4 className="sidebar__widget-title">Tags</h4>
      <div className="sidebar__tag-list">
        <ul className="list-wrap">
          {tags.map((category) => (
            <li key={category.id}>
              <a href="#">{category.text}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
