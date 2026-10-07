const categories = [
  { id: 1, text: "Teak Main Doors" },
  { id: 2, text: "Carved Pooja Doors" },
  { id: 3, text: "Veneer & Laminate Doors" },
  { id: 4, text: "Waterproof WPC Doors" },
  { id: 5, text: "Moulded Skin Doors" },
  { id: 6, text: "Custom Door Crafting" },
];

export default function Categories() {
  return (
    <div className="sidebar__widget">
      <h4 className="sidebar__widget-title">Categories</h4>
      <div className="sidebar__cat-list">
        <ul className="list-wrap">
          {categories.map((link) => (
            <li key={link.id}>
              <a href="#">{link.text}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
