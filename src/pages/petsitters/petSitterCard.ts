import type { PetSitters } from "../../ts/types.ts";

export function createPetSitterCard(
  ps: PetSitters,
  expandedId: number | null,
): HTMLElement {
  const imageSrc = ps.image ? `/src/${ps.image}` : "/src/assets/dogsitter1.png";

  const card = document.createElement("article");
  card.className = "card sitter-row";

  card.innerHTML = `
    <div class="sitter-portrait">
      <img
        src="${imageSrc}"
        alt="Portrett av ${ps.name}"
        width="96"
        height="96"
        loading="lazy"
      />
    </div>

    <div class="sitter-info">
      <h3 class="sitter-name">${ps.name}</h3>
      <p class="sitter-meta">${ps.location}</p>

      <div class="sitter-badges">
        <span class="badge">${ps.available ? "Ledig" : "Ikke ledig"}</span>
        <span class="badge">${ps.yearsOfExperience} års erfaring</span>
      </div>

      <p class="sitter-desc">${ps.experienceDescription ?? ""}</p>
    </div>

    <div class="sitter-side">
      <p class="sitter-price">
        <strong>${ps.pricePerDay} kr</strong> / døgn
      </p>

      <p class="sitter-rating">
        ★ ${ps.rating}
        <span class="muted">(${ps.reviewCount} anmeldelser)</span>
      </p>

      <div class="sitter-card-actions">
        <button class="btn btn-primary details-btn" type="button">
          ${expandedId === ps.id ? "Skjul detaljer" : "Se detaljer"}
        </button>

        <button class="btn btn-ghost edit-btn" type="button">
          Rediger
        </button>

        <button class="btn-delete delete-btn" type="button">
          Slett
        </button>
      </div>
    </div>

    ${
      expandedId === ps.id
        ? `
          <div class="sitter-details">
            <h4>Detaljer</h4>
            <p><strong>Erfaring:</strong> ${ps.yearsOfExperience} år</p>
            <p><strong>Beskrivelse:</strong> ${ps.experienceDescription ?? ""}</p>
            <p><strong>Maks antall hunder:</strong> ${ps.maxDogs}</p>
            <p><strong>Tar valper:</strong> ${ps.acceptsPuppies ? "Ja" : "Nei"}</p>
            <p><strong>Tar store hunder:</strong> ${ps.acceptsLargeDogs ? "Ja" : "Nei"}</p>
          </div>
        `
        : ""
    }
  `;

  return card;
}
