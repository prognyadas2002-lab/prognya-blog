/* ==========================================================================
   KOLKATA FOOD CHRONICLES - FRONTEND JAVASCRIPT LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSearchModal();
  initRestaurantFilters();
  initRecipeScalerAndModal();
  initCommunityForm();
  initCityGuidesSharing();
  initFooterNewsletterAndExplore();
});

/* --------------------------------------------------------------------------
   1. NAVIGATION & SINGLE PAGE ROUTER
   -------------------------------------------------------------------------- */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const pageViews = document.querySelectorAll('.page-view');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');

  function setActiveView(viewId) {
    const targetId = viewId || 'eats-out';

    pageViews.forEach(view => {
      if (view.id === targetId) {
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
      }
    });

    navLinks.forEach(link => {
      const linkHash = link.getAttribute('href').replace('#', '');
      if (linkHash === targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (mobileDrawer.classList.contains('open')) {
      mobileDrawer.classList.remove('open');
    }
  }

  // Handle hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) setActiveView(hash);
  });

  // Initial load hash check
  const initialHash = window.location.hash.replace('#', '') || 'eats-out';
  setActiveView(initialHash);

  // Mobile Menu Toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });
  }
}

/* --------------------------------------------------------------------------
   2. SEARCH MODAL LOGIC
   -------------------------------------------------------------------------- */
function initSearchModal() {
  const searchTrigger = document.getElementById('searchTrigger');
  const searchModal = document.getElementById('searchModal');
  const closeSearchModal = document.getElementById('closeSearchModal');
  const searchInput = document.getElementById('searchInput');

  if (searchTrigger && searchModal) {
    searchTrigger.addEventListener('click', () => {
      searchModal.classList.add('open');
      setTimeout(() => searchInput.focus(), 100);
    });

    closeSearchModal.addEventListener('click', () => {
      searchModal.classList.remove('open');
    });

    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) searchModal.classList.remove('open');
    });
  }
}

/* --------------------------------------------------------------------------
   3. KOLKATA PLACE DISCOVERY FILTERS (3 DROPDOWNS)
   -------------------------------------------------------------------------- */
function initRestaurantFilters() {
  const locationSelect = document.getElementById('locationFilter');
  const priceSelect = document.getElementById('priceFilter');
  const vibeSelect = document.getElementById('vibeFilter');
  const cards = document.querySelectorAll('.restaurant-card');

  function filterCards() {
    const selectedLocation = locationSelect ? locationSelect.value.toLowerCase() : 'all';
    const selectedPrice = priceSelect ? priceSelect.value.toLowerCase() : 'all';
    const selectedVibe = vibeSelect ? vibeSelect.value.toLowerCase() : 'all';

    let visibleCount = 0;

    cards.forEach(card => {
      const cardNeighborhood = (card.dataset.neighborhood || '').toLowerCase();
      const cardPrice = (card.dataset.price || '').toLowerCase();
      const cardVibe = (card.dataset.vibe || '').toLowerCase();

      // Check location match
      const matchLocation = (selectedLocation === 'all') || cardNeighborhood.includes(selectedLocation);

      // Check price match
      const matchPrice = (selectedPrice === 'all') || cardPrice.includes(selectedPrice);

      // Check vibe match
      const matchVibe = (selectedVibe === 'all') || cardVibe.includes(selectedVibe);

      if (matchLocation && matchPrice && matchVibe) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Handle no results message
    const grid = document.getElementById('restaurantGrid');
    let noResultsEl = document.getElementById('noFilterResults');
    if (visibleCount === 0) {
      if (!noResultsEl && grid) {
        noResultsEl = document.createElement('div');
        noResultsEl.id = 'noFilterResults';
        noResultsEl.className = 'no-results-msg';
        noResultsEl.innerHTML = '<h3>No Kolkata experiences match your exact filter combination.</h3><p>Try selecting "All Places" or resetting the Price/Vibe dropdowns to discover more places.</p>';
        grid.parentNode.appendChild(noResultsEl);
      } else if (noResultsEl) {
        noResultsEl.style.display = 'block';
      }
    } else if (noResultsEl) {
      noResultsEl.style.display = 'none';
    }
  }

  if (locationSelect) locationSelect.addEventListener('change', filterCards);
  if (priceSelect) priceSelect.addEventListener('change', filterCards);
  if (vibeSelect) vibeSelect.addEventListener('change', filterCards);
}

/* --------------------------------------------------------------------------
   4. RECIPE SCALER & MODAL LOGIC
   -------------------------------------------------------------------------- */
function initRecipeScalerAndModal() {
  const recipeModal = document.getElementById('recipeModal');
  const closeRecipeModal = document.getElementById('closeRecipeModal');
  const recipeDetailBtns = document.querySelectorAll('.view-recipe-btn');
  const scaleBtns = document.querySelectorAll('.scale-btn');
  const ingredientQuantities = document.querySelectorAll('.ingredient-qty');

  recipeDetailBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (recipeModal) recipeModal.classList.add('open');
    });
  });

  if (closeRecipeModal && recipeModal) {
    closeRecipeModal.addEventListener('click', () => {
      recipeModal.classList.remove('open');
    });
  }

  // Interactive Serving Scaler
  scaleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const scaleFactor = parseFloat(btn.dataset.scale);
      scaleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      ingredientQuantities.forEach(qtyEl => {
        const baseQty = parseFloat(qtyEl.dataset.base);
        if (!isNaN(baseQty)) {
          qtyEl.textContent = (baseQty * scaleFactor).toFixed(1).replace(/\.0$/, '');
        }
      });

      showToast(`Adjusted recipe quantities for ${btn.textContent} portions`);
    });
  });
}

/* --------------------------------------------------------------------------
   5. COMMUNITY FORM SUBMISSION & LOCALSTORAGE FEED
   -------------------------------------------------------------------------- */
function initCommunityForm() {
  const form = document.getElementById('communityForm');
  const feedContainer = document.getElementById('communityFeedGrid');
  const fileInput = document.getElementById('photoInput');
  const dropzone = document.getElementById('dropzone');
  const previewThumb = document.getElementById('previewThumb');
  const starInputs = document.querySelectorAll('#starRatingSelect .star');
  
  let selectedRating = 5;
  let uploadedPhotoData = 'assets/images/shorshe_ilish.jpg';

  // Star rating selector
  starInputs.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.value);
      starInputs.forEach((s, idx) => {
        if (idx < selectedRating) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
  });

  // Photo uploader preview
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedPhotoData = event.target.result;
          previewThumb.src = uploadedPhotoData;
          previewThumb.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Load existing reader posts from LocalStorage
  function loadCommunityPosts() {
    if (!feedContainer) return;
    const storedPosts = JSON.parse(localStorage.getItem('kfc_reader_posts') || '[]');
    
    // Render initial sample + stored posts
    if (storedPosts.length > 0) {
      storedPosts.forEach(post => {
        const postCard = document.createElement('article');
        postCard.className = 'restaurant-card';
        postCard.innerHTML = `
          <div class="card-image-wrap">
            <img src="${post.photo}" alt="${post.dish}">
            <div class="card-top-badges">
              <span class="badge badge-terracotta">${post.neighborhood}</span>
              <span class="star-rating">★ ${post.rating}.0</span>
            </div>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span>Submitted by <strong>${post.name}</strong></span>
              <span class="badge badge-green">Verified Reader</span>
            </div>
            <h3 class="card-title">${post.dish}</h3>
            <p>${post.story}</p>
            <div class="card-footer">
              <span style="font-size:0.85rem; color: var(--text-muted);">❤️ ${post.likes} Yums</span>
              <button class="btn btn-sm btn-outline like-btn">❤️ Yum!</button>
            </div>
          </div>
        `;
        feedContainer.prepend(postCard);
      });
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('authorName').value;
      const dish = document.getElementById('dishTitle').value;
      const neighborhood = document.getElementById('location').value;
      const story = document.getElementById('storyText').value;

      const newPost = {
        name,
        dish,
        neighborhood,
        story,
        rating: selectedRating,
        photo: uploadedPhotoData,
        likes: 1
      };

      const storedPosts = JSON.parse(localStorage.getItem('kfc_reader_posts') || '[]');
      storedPosts.push(newPost);
      localStorage.setItem('kfc_reader_posts', JSON.stringify(storedPosts));

      showToast('🎉 Your culinary story was published to The Reader’s Table!');
      form.reset();
      if (previewThumb) previewThumb.style.display = 'none';

      setTimeout(() => location.reload(), 1200);
    });
  }

  loadCommunityPosts();
}

/* --------------------------------------------------------------------------
   6. CITY GUIDES BOOKMARK & SHARING
   -------------------------------------------------------------------------- */
function initCityGuidesSharing() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('.share-btn')) {
      const pageUrl = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(pageUrl);
        showToast('📋 Link copied to clipboard! Share it with fellow foodies.');
      } else {
        showToast('🔗 Sharing enabled!');
      }
    }

    if (e.target.closest('.bookmark-btn')) {
      const btn = e.target.closest('.bookmark-btn');
      btn.classList.toggle('active');
      showToast(btn.classList.contains('active') ? '⭐ Saved to your foodie bookmarks!' : 'Removed from bookmarks');
    }
  });
}

/* --------------------------------------------------------------------------
   7. TOAST NOTIFICATION SYSTEM
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>🍲</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* --------------------------------------------------------------------------
   8. FOOTER NEWSLETTER & EXPLORE REGION FILTER HANDLERS
   -------------------------------------------------------------------------- */
function initFooterNewsletterAndExplore() {
  const form = document.getElementById('footerNewsletterForm');
  const emailInput = document.getElementById('footerEmailInput');
  const submitBtn = document.getElementById('footerSubscribeBtn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput ? emailInput.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email || !emailRegex.test(email)) {
        showToast('⚠️ Please enter a valid email address.');
        if (emailInput) emailInput.focus();
        return;
      }

      const existingSubs = JSON.parse(localStorage.getItem('subscribed_emails') || '[]');
      if (existingSubs.includes(email.toLowerCase())) {
        showToast('ℹ️ You are already subscribed to the Friday Foodie Newsletter!');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Subscribing...';
      }

      setTimeout(() => {
        existingSubs.push(email.toLowerCase());
        localStorage.setItem('subscribed_emails', JSON.stringify(existingSubs));
        
        showToast('🎉 Thank you for subscribing to Friday Foodie Newsletter!');
        if (emailInput) emailInput.value = '';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Subscribe';
        }
      }, 600);
    });
  }
}

// Global helper to trigger location filtering from Footer Explore links
window.triggerLocationFilter = function(regionValue) {
  const locationSelect = document.getElementById('locationFilter');
  if (locationSelect) {
    locationSelect.value = regionValue;
    locationSelect.dispatchEvent(new Event('change'));
  }
};

/* ==========================================================================
   9. GOOGLE MAPS PLATFORM INTEGRATION
   Source: Google Maps Platform Code Assist
   ========================================================================== */
window.initGoogleMap = function() {
  const mapElement = document.getElementById('googleMap');
  if (!mapElement) return;

  // Kolkata center coordinates
  const kolkataCenter = { lat: 22.5726, lng: 88.3639 };

  // Initialize Map with mandatory mapId for AdvancedMarkerElement
  const map = new google.maps.Map(mapElement, {
    zoom: 12.5,
    center: kolkataCenter,
    mapId: 'DEMO_MAP_ID', // Cloud map ID requirement for Advanced Markers
    mapTypeControl: false,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      {
        featureType: "poi.business",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  });

  // Kolkata Culinary Discovery Locations
  const kolkataLocations = [
    {
      title: "Mocambo Restaurant & Bar",
      location: { lat: 22.5535, lng: 88.3533 },
      neighborhood: "Park Street",
      type: "Heritage Colonial Fine Dining",
      mustTry: "Baked Devilled Crab & Beckty Bell-Helena",
      rating: "★ 4.9"
    },
    {
      title: "Arsalan Restaurant",
      location: { lat: 22.5448, lng: 88.3644 },
      neighborhood: "Park Circus",
      type: "Mughlai Institution",
      mustTry: "Special Mutton Biryani & Mutton Rezala",
      rating: "★ 4.8"
    },
    {
      title: "Chitto Babur Dokan",
      location: { lat: 22.5697, lng: 88.3512 },
      neighborhood: "Dacres Lane / Esplanade",
      type: "Historic Street Food Lane",
      mustTry: "Chicken Stew & Fabled Buttered Toast",
      rating: "★ 4.4"
    },
    {
      title: "Flurys Tearoom",
      location: { lat: 22.5538, lng: 88.3528 },
      neighborhood: "Park Street",
      type: "Swiss Confectionery Since 1927",
      mustTry: "Full English Breakfast & Rich Rum Balls",
      rating: "★ 4.1"
    },
    {
      title: "Aami Bangali",
      location: { lat: 22.5285, lng: 88.3650 },
      neighborhood: "Ballygunge",
      type: "Authentic Ghoti & Bangal Cuisine",
      mustTry: "Kochupata Bhapa Chingri & Chital Muitha",
      rating: "★ 4.3"
    },
    {
      title: "Mitra Café",
      location: { lat: 22.5982, lng: 88.3680 },
      neighborhood: "Sovabazar",
      type: "100-Year North Cabin Legend",
      mustTry: "Original Bhetki Fish Fry & Mutton Brain Chop",
      rating: "★ 4.6"
    },
    {
      title: "The Salt House Lounge",
      location: { lat: 22.5804, lng: 88.4168 },
      neighborhood: "Salt Lake",
      type: "Rooftop Sky Lounge",
      mustTry: "Artisanal Cocktails & Burrata Flatbread",
      rating: "★ 4.7"
    },
    {
      title: "Cafe O Kobita",
      location: { lat: 22.6015, lng: 88.3712 },
      neighborhood: "Shyambazar",
      type: "Aesthetic & Cozy Café",
      mustTry: "Pizza & Lasagna",
      rating: "★ 4.1"
    },
    {
      title: "Cafe at Calcutta",
      location: { lat: 22.6030, lng: 88.3725 },
      neighborhood: "Shyambazar",
      type: "Traditional & Heritage",
      mustTry: "Mojito",
      rating: "★ 4.1"
    },
    {
      title: "Peter Cat",
      location: { lat: 22.5532, lng: 88.3530 },
      neighborhood: "Park Street",
      type: "Heritage Colonial Dining",
      mustTry: "Mutton Rogan Josh & Chelo Kebab",
      rating: "★ 3.8"
    },
    {
      title: "Roastery Coffee House",
      location: { lat: 22.5185, lng: 88.3662 },
      neighborhood: "Gariahat / Hindustan Park",
      type: "Specialty Coffee & Heritage Patio",
      mustTry: "Cranberry Espresso Tonic & Cardamom Latte",
      rating: "★ 4.7"
    }
  ];

  const infoWindow = new google.maps.InfoWindow();

  kolkataLocations.forEach(spot => {
    let marker;

    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      // AdvancedMarkerElement Pin Styling
      const pinGlyph = document.createElement('div');
      pinGlyph.style.background = '#4A1521';
      pinGlyph.style.color = '#FFFDF9';
      pinGlyph.style.padding = '6px 12px';
      pinGlyph.style.borderRadius = '20px';
      pinGlyph.style.fontWeight = '700';
      pinGlyph.style.fontSize = '12px';
      pinGlyph.style.fontFamily = "'Montserrat', sans-serif";
      pinGlyph.style.border = '2px solid #E05A47';
      pinGlyph.style.boxShadow = '0 3px 10px rgba(0,0,0,0.3)';
      pinGlyph.style.cursor = 'pointer';
      pinGlyph.innerHTML = `📍 ${spot.title}`;

      marker = new google.maps.marker.AdvancedMarkerElement({
        map: map,
        position: spot.location,
        title: spot.title,
        content: pinGlyph
      });
    } else {
      // Fallback Marker
      marker = new google.maps.Marker({
        position: spot.location,
        map: map,
        title: spot.title
      });
    }

    const contentString = `
      <div style="padding: 8px 12px; max-width: 250px; font-family: 'Open Sans', sans-serif;">
        <span style="background: #E05A47; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 10px; font-weight: 700; text-transform: uppercase;">${spot.neighborhood}</span>
        <h4 style="margin: 6px 0 4px; color: #4A1521; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 700;">${spot.title}</h4>
        <p style="margin: 0 0 6px; font-size: 12px; color: #555;">${spot.type} • <strong style="color: #4A1521;">${spot.rating}</strong></p>
        <div style="font-size: 11px; color: #E05A47; font-weight: 600;">⭐ ${spot.mustTry}</div>
      </div>
    `;

    if (marker.addListener) {
      marker.addListener('click', () => {
        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);
      });
    } else if (marker.addEventListener) {
      marker.addEventListener('click', () => {
        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);
      });
    }
  });
};

/* ==========================================================================
   GOOGLE MAPS AUTH FAILURE & LEAFLET MAP FALLBACK ENGINE
   ========================================================================== */
window.gm_authFailure = function() {
  console.warn("Google Maps API Key lacks active GCP billing or Maps JS API activation. Initializing Leaflet map engine...");
  loadLeafletFallbackMap();
};

function loadLeafletFallbackMap() {
  const mapElement = document.getElementById('googleMap');
  if (!mapElement || mapElement.dataset.loadedFallback === 'true') return;
  mapElement.dataset.loadedFallback = 'true';
  mapElement.innerHTML = ''; // Clear google error modal DOM elements

  if (typeof L === 'undefined') return;

  const map = L.map('googleMap').setView([22.5726, 88.3639], 12.5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors | Kolkata Chronicles'
  }).addTo(map);

  const kolkataLocations = [
    {
      title: "Mocambo Restaurant & Bar",
      lat: 22.5535, lng: 88.3533,
      neighborhood: "Park Street",
      type: "Heritage Colonial Fine Dining",
      mustTry: "Baked Devilled Crab & Beckty Bell-Helena",
      rating: "★ 4.9"
    },
    {
      title: "Arsalan Restaurant",
      lat: 22.5448, lng: 88.3644,
      neighborhood: "Park Circus",
      type: "Mughlai Institution",
      mustTry: "Special Mutton Biryani & Mutton Rezala",
      rating: "★ 4.8"
    },
    {
      title: "Chitto Babur Dokan",
      lat: 22.5697, lng: 88.3512,
      neighborhood: "Dacres Lane / Esplanade",
      type: "Historic Street Food Lane",
      mustTry: "Chicken Stew & Buttered Toast",
      rating: "★ 4.7"
    },
    {
      title: "Flurys Tearoom",
      lat: 22.5538, lng: 88.3528,
      neighborhood: "Park Street",
      type: "Swiss Confectionery Since 1927",
      mustTry: "Full English Breakfast & Rum Balls",
      rating: "★ 4.6"
    },
    {
      title: "Kewpie’s Kitchen",
      lat: 22.5385, lng: 88.3524,
      neighborhood: "Ballygunge",
      type: "Authentic Bengali Thali",
      mustTry: "Grand Zamindari Thali & Daab Chingri",
      rating: "★ 4.8"
    },
    {
      title: "Mitra Café",
      lat: 22.5982, lng: 88.3680,
      neighborhood: "Sovabazar",
      type: "100-Year North Cabin Legend",
      mustTry: "Fish Diamond Fry & Brain Chop",
      rating: "★ 4.9"
    },
    {
      title: "The Salt House Lounge",
      lat: 22.5804, lng: 88.4168,
      neighborhood: "Salt Lake",
      type: "Rooftop Sky Lounge",
      mustTry: "Artisanal Cocktails & Burrata Flatbread",
      rating: "★ 4.7"
    }
  ];

  kolkataLocations.forEach(spot => {
    const customIcon = L.divIcon({
      className: 'leaflet-custom-pin',
      html: `<div style="background:#4A1521; color:#FFFDF9; padding:5px 11px; border-radius:16px; border:2px solid #E05A47; font-weight:700; font-size:11px; font-family:'Montserrat',sans-serif; box-shadow:0 3px 10px rgba(0,0,0,0.3); white-space:nowrap; cursor:pointer;">📍 ${spot.title}</div>`,
      iconSize: [120, 30],
      iconAnchor: [60, 15]
    });

    const marker = L.marker([spot.lat, spot.lng], { icon: customIcon }).addTo(map);

    const popupContent = `
      <div style="padding: 4px 6px; font-family: 'Open Sans', sans-serif;">
        <span style="background: #E05A47; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 10px; font-weight: 700; text-transform: uppercase;">${spot.neighborhood}</span>
        <h4 style="margin: 6px 0 4px; color: #4A1521; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700;">${spot.title}</h4>
        <p style="margin: 0 0 6px; font-size: 11px; color: #555;">${spot.type} • <strong style="color: #4A1521;">${spot.rating}</strong></p>
        <div style="font-size: 11px; color: #E05A47; font-weight: 600;">⭐ ${spot.mustTry}</div>
      </div>
    `;

    marker.bindPopup(popupContent);
  });
}

/* ==========================================================================
   REVIEW MODAL OPEN/CLOSE HANDLERS
   ========================================================================== */
window.openReviewModal = function(reviewId) {
  let modalId = '';
  if (reviewId === 'cafe-o-kobita') modalId = 'cafeOKobitaModal';
  else if (reviewId === 'cafe-at-calcutta') modalId = 'cafeAtCalcuttaModal';
  else if (reviewId === 'peter-cat') modalId = 'peterCatModal';
  else if (reviewId === 'mitra-cafe') modalId = 'mitraCafeModal';
  else if (reviewId === 'chitto-babur-dokan') modalId = 'chittoBaburDokanModal';
  else if (reviewId === 'roastery-coffee-house') modalId = 'roasteryCoffeeHouseModal';
  else if (reviewId === 'aami-bangali') modalId = 'aamiBangaliModal';
  else if (reviewId === 'flurys-tearoom' || reviewId === 'flurys') modalId = 'flurysTearoomModal';

  if (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }
};

window.closeReviewModal = function(reviewId) {
  let modalId = '';
  if (reviewId === 'cafe-o-kobita') modalId = 'cafeOKobitaModal';
  else if (reviewId === 'cafe-at-calcutta') modalId = 'cafeAtCalcuttaModal';
  else if (reviewId === 'peter-cat') modalId = 'peterCatModal';
  else if (reviewId === 'mitra-cafe') modalId = 'mitraCafeModal';
  else if (reviewId === 'chitto-babur-dokan') modalId = 'chittoBaburDokanModal';
  else if (reviewId === 'roastery-coffee-house') modalId = 'roasteryCoffeeHouseModal';
  else if (reviewId === 'aami-bangali') modalId = 'aamiBangaliModal';
  else if (reviewId === 'flurys-tearoom' || reviewId === 'flurys') modalId = 'flurysTearoomModal';

  if (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
};
