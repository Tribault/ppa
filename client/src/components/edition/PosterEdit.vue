<template class="poster-edit">
  <Transition name="poster-edit-fade">
    <div v-if="visible" class="poster-edit-overlay">
      <Transition name="poster-edit-popup">
        <div class="poster-edit-box" @click.stop>
          <button class="poster-edit-close-btn btn-red-bg" @click="close"><x-mark-icon /></button>

          <h2 class="poster-edit-title">
            {{ posterToEdit?._id ? $t('form.poster.editTitle') : $t('form.poster.createTitle') }}
          </h2>

          <form @submit.prevent="submit" class="poster-edit-form">
            <div class="poster-edit-form--row">
              <b>{{ $t('form.poster.titleLabel') }}</b>
              <input
                v-model="form.title"
                :placeholder="$t('form.poster.titlePlaceholder')"
                class="poster-edit-input"
              />
              <button type="button" class="btn-red-bg" @click="searchMovie" :disabled="!form.title || searching">
                <magnifying-glass-icon /> {{ $t('form.poster.searchMovie') }}
              </button>
            </div>
            <div v-if="movieResults.length" class="poster-edit-movie-results">
              <button
                v-for="(result, i) in movieResults"
                :key="i"
                type="button"
                class="poster-edit-movie-result"
                @click="applyMovieResult(result)"
              >
                <img v-if="result.posterUrl" :src="result.posterUrl" alt="" />
                <span>{{ result.title }} <template v-if="result.year">({{ result.year }})</template></span>
                <em>{{ result.source }}</em>
              </button>
            </div>
            <p v-else-if="searched" class="poster-edit-movie-no-results">{{ $t('form.poster.noMovieResults') }}</p>

            <div v-if="form.image" class="poster-edit-form--row">
              <div class="poster-edit-preview">
                <img :src="previewUrl" alt="Poster preview" />
              </div>
            </div>
            <div v-if="tmdbPosterOptions.length" class="poster-edit-form--row">
              <button type="button" class="btn-red-bg" @click="showPosterPicker = true">
                <photo-icon /> {{ $t('form.poster.viewSuggestedPosters', { count: tmdbPosterOptions.length }) }}
              </button>
            </div>
            <div v-if="movieLookupAttempted && !showManualUpload" class="poster-edit-form--row">
              <button type="button" class="btn-link" @click="showManualUpload = true">
                {{ $t('form.poster.uploadManually') }}
              </button>
            </div>
            <div v-if="showManualUpload" class="poster-edit-form--row">
              <input
                type="file"
                accept="image/*"
                @change="handleFileUpload"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>{{ $t('form.poster.filmmakerLabel') }}</b>
              <input
                v-model="form.filmmaker"
                :placeholder="$t('form.poster.filmmakerPlaceholder')"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>{{ $t('form.poster.yearLabel') }}</b>
              <input
                v-model.number="form.year"
                type="number"
                :placeholder="$t('form.poster.yearPlaceholder')"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>{{ $t('form.poster.mainActorsLabel') }}</b>
              <input
                v-model="mainActorsText"
                :placeholder="$t('form.poster.mainActorsPlaceholder')"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>{{ $t('form.poster.genreLabel') }}</b>
              <input
                v-model="form.genre"
                :placeholder="$t('form.poster.genrePlaceholder')"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>{{ $t('form.poster.countryLabel') }}</b>
              <input
                v-model="form.country"
                :placeholder="$t('form.poster.countryPlaceholder')"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>{{ $t('form.poster.sizeLabel') }}</b>
              <div class="radio-group">
                <span class="radio-option">
                  <input type="radio" id="sizeL" value="120*160 cm" v-model="sizeChoice" />
                  <label for="sizeL">{{ $t('form.poster.size120') }}</label>
                </span>
                <span class="radio-option">
                  <input type="radio" id="sizeM" value="60*80 cm" v-model="sizeChoice" />
                  <label for="sizeM">{{ $t('form.poster.size60') }}</label>
                </span>
                <span class="radio-option">
                  <input type="radio" id="sizeOther" value="other" v-model="sizeChoice" />
                  <label for="sizeOther">{{ $t('form.poster.sizeOther') }}</label>
                </span>
              </div>
              <input
                v-if="sizeChoice === 'other'"
                v-model="form.size"
                type="text"
                :placeholder="$t('form.poster.sizeOtherPlaceholder')"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>{{ $t('form.poster.priceLabel') }}</b>
              <input
                v-model.number="form.price"
                type="number"
                :placeholder="$t('form.poster.pricePlaceholder')"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>{{ $t('form.poster.stockLabel') }}</b>
              <input
                v-model.number="form.totalStock"
                type="number"
                :placeholder="$t('form.poster.stockPlaceholder')"
                class="poster-edit-input stock"
                :min="posterToEdit?.stockInfo?.availableStock"
              />
              <div v-if="posterToEdit?._id" class="poster-edit-form--row">
              <p class="tag-white">{{ $t('form.poster.available') }} {{posterToEdit?.stockInfo?.availableStock}}</p>
              <p class="tag-white">{{ $t('form.poster.reserved') }} {{posterToEdit?.stockInfo?.pending}}</p>
              <p class="tag-white">{{ $t('form.poster.ready') }} {{posterToEdit?.stockInfo?.ready}}</p>
              <p class="tag-white">{{ $t('form.poster.sold') }} {{posterToEdit?.stockInfo?.confirmed}}</p>
              </div>
            </div>
            <div class="poster-edit-form--row">
              <b>{{ $t('form.poster.commentLabel') }}</b>
              <input
                v-model="form.note"
                type="text"
                :placeholder="$t('form.poster.commentPlaceholder')"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>{{ $t('form.poster.tagsLabel') }}</b>
              <chip-input
                v-model="form.tags"
                :options="tagStore.tags"
                :placeholder="$t('form.poster.tagsPlaceholder')"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>{{ $t('form.poster.locationsLabel') }}</b>
              <chip-input
                v-model="form.locations"
                :options="locationStore.locations"
                :placeholder="$t('form.poster.locationsPlaceholder')"
              />
            </div>
             <div class="poster-edit-form--row">
              <b>{{ $t('form.poster.forSale') }}</b>
              <div class="radio-group">
                <span class="radio-option">
                  <input type="radio" id="sale" value=true v-model="form.forSale" />
                  <label for="sale">{{ $t('form.poster.yes') }}</label>
                </span>
                <span class="radio-option">
                  <input type="radio" id="noSale" value=false v-model="form.forSale" />
                  <label for="noSale">{{ $t('form.poster.no') }}</label>
                </span>
              </div>
            </div>

            <div class="poster-edit-form--actions">
              <button type="submit" class="btn-red-bg">
                <b>{{ $t('form.poster.save') }}</b> <folder-arrow-down-icon />
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
  <poster-image-picker
    :visible="showPosterPicker"
    :options="tmdbPosterOptions"
    :selected-path="selectedPosterPath"
    :loading="adoptingPoster"
    @close="showPosterPicker = false"
    @select="selectPosterOption"
  />
  <div v-if="showDuplicateModal" class="poster-edit-duplicate-overlay" @click="showDuplicateModal = false">
    <div class="poster-edit-duplicate-box" @click.stop>
      <p>{{ $t('form.poster.duplicateWarning') }}</p>
      <div class="poster-edit-duplicate-actions">
        <router-link
          v-if="duplicatePoster"
          :to="{ name: 'posters', params: { id: duplicatePoster._id } }"
          class="btn-white-bg"
          @click="closeDuplicateModal(true)"
        >
          {{ $t('form.poster.viewExistingPoster') }}
        </router-link>
        <button type="button" class="btn-white-bg" @click="showDuplicateModal = false">
          {{ $t('modal.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Poster, MovieSearchResult, TmdbPosterOption } from '@/types/models'
import { XMarkIcon, FolderArrowDownIcon, MagnifyingGlassIcon, PhotoIcon } from '@heroicons/vue/24/solid'
import { usePosterStore } from '@/stores/posters'
import { useTagStore } from '@/stores/tags'
import { useLocationStore } from '@/stores/locations'
import { useMovieStore } from '@/stores/movies'
import PosterImagePicker from './PosterImagePicker.vue'
import ChipInput from '@/components/utils/ChipInput.vue'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
const toast = useToast()
const { t } = useI18n()

const props = defineProps<{
  visible: boolean
  posterToEdit: Poster | null
}>()
const emit = defineEmits(['close', 'saved'])

const store = usePosterStore()
const tagStore = useTagStore()
const locationStore = useLocationStore()
const movieStore = useMovieStore()

const form = ref<{
  title: string
  size: string
  price: number
  note: string
  totalStock: number
  tags: string[]
  locations: string[]
  image: File | string | null
  forSale: Boolean
  filmmaker: string
  year: number | null
  mainActors: string[]
  genre: string
  country: string
}>({
  title: '',
  size: '120*160 cm',
  price: 0,
  note: '',
  totalStock: 0,
  tags: [],
  locations: [],
  image: null,
  forSale: false,
  filmmaker: '',
  year: null,
  mainActors: [],
  genre: '',
  country: ''
})

const mainActorsText = computed({
  get: () => form.value.mainActors.join(', '),
  set: (val: string) => {
    form.value.mainActors = val.split(',').map((a) => a.trim()).filter(Boolean)
  }
})

const sizeChoice = computed({
  get: () => {
    if (form.value.size === '120*160 cm' || form.value.size === '60*80 cm') return form.value.size
    return 'other'
  },
  set: (val: string) => {
    form.value.size = val === 'other' ? '' : val
  }
})

const previewUrl = ref<string>('')
const movieResults = ref<MovieSearchResult[]>([])
const searching = ref(false)
const searched = ref(false)
const tmdbPosterOptions = ref<TmdbPosterOption[]>([])
const selectedPosterPath = ref<string | null>(null)
const adoptingPoster = ref(false)
const showPosterPicker = ref(false)
// Manual upload is a fallback, not the default: it only appears once a movie
// search has come up empty, once a picked movie has no poster suggestions, or
// the admin explicitly asks for it (none of the suggestions fit).
const showManualUpload = ref(false)
const movieLookupAttempted = ref(false)
const showDuplicateModal = ref(false)
const duplicatePoster = ref<{ _id: string; title: string } | null>(null)

async function searchMovie() {
  searching.value = true
  searched.value = true
  movieLookupAttempted.value = true
  tmdbPosterOptions.value = []
  selectedPosterPath.value = null
  try {
    movieResults.value = await movieStore.searchMovies(form.value.title)
    if (movieResults.value.length === 0) showManualUpload.value = true
  } catch (err) {
    console.error(err)
    toast.error(t('form.poster.error'))
  } finally {
    searching.value = false
  }
}

async function applyMovieResult(result: MovieSearchResult) {
  try {
    const details = result.source === 'tmdb' && result.id
      ? await movieStore.getTmdbDetails(result.id)
      : result

    form.value.filmmaker = details.filmmaker || ''
    form.value.year = details.year ? Number(details.year) : null
    form.value.mainActors = details.mainActors || []
    form.value.genre = details.genre || ''
    form.value.country = details.country || ''
    movieResults.value = []
    searched.value = false

    // Poster art is a suggestion, not an autofill — manual upload stays available
    // and takes precedence, since French affiches aren't always the top TMDB match.
    tmdbPosterOptions.value = result.source === 'tmdb' && result.id
      ? await movieStore.getTmdbPosters(result.id)
      : []
    selectedPosterPath.value = null
    if (tmdbPosterOptions.value.length === 0) {
      showManualUpload.value = true
    } else {
      showPosterPicker.value = true
    }

    try {
      const dup = await store.checkDuplicateTitle(form.value.title, props.posterToEdit?._id)
      if (dup.exists && dup.poster) {
        duplicatePoster.value = dup.poster
        showDuplicateModal.value = true
      }
    } catch (err) {
      console.error(err)
    }
  } catch (err) {
    console.error(err)
    toast.error(t('form.poster.error'))
  }
}

function closeDuplicateModal(navigating = false) {
  showDuplicateModal.value = false
  if (navigating) close()
}

async function selectPosterOption(option: TmdbPosterOption) {
  adoptingPoster.value = true
  try {
    const filename = await movieStore.selectTmdbPoster(option.path)
    form.value.image = filename
    previewUrl.value = import.meta.env.VITE_IMG_URL + filename
    selectedPosterPath.value = option.path
    showPosterPicker.value = false
  } catch (err) {
    console.error(err)
    toast.error(t('form.poster.error'))
  } finally {
    adoptingPoster.value = false
  }
}

onMounted(async () => {
  await tagStore.fetchTags()
  await locationStore.fetchLocations()
})

watch(
  () => props.posterToEdit,
  (val) => {
    if (val) {
      form.value = {
        ...val,
        tags: (val.tags ?? []).map((t) => t._id),
        locations: (val.locations ?? []).map((l) => l._id),
        image: val.image || null,
        filmmaker: val.filmmaker || '',
        year: val.year ?? null,
        mainActors: val.mainActors ?? [],
        genre: val.genre || '',
        country: val.country || '',
      }
      previewUrl.value = val.image ? import.meta.env.VITE_IMG_URL + val.image : ''
    } else {
      form.value = {
        title: '',
        size: '120*160 cm',
        price: 0,
        totalStock: 0,
        note: '',
        tags: [],
        locations: [],
        image: null,
        forSale: false,
        filmmaker: '',
        year: null,
        mainActors: [],
        genre: '',
        country: '',
      }
      previewUrl.value = ''
    }
    movieResults.value = []
    searched.value = false
    tmdbPosterOptions.value = []
    selectedPosterPath.value = null
    showPosterPicker.value = false
    movieLookupAttempted.value = false
    showDuplicateModal.value = false
    duplicatePoster.value = null
    // Editing an existing poster already has an image to manage — show the
    // upload control right away. Creating a new one starts search-first.
    showManualUpload.value = !!val
  },
  { immediate: true },
)

function close() {
  emit('close')
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    form.value.image = file
    previewUrl.value = URL.createObjectURL(file)
    selectedPosterPath.value = null
  }
}

function capitalizeTitle(string: String){
  return string.charAt(0).toLocaleUpperCase() + string.slice(1)
}

async function submit() {
  try {
    const formData = new FormData()
    formData.append('title', capitalizeTitle(form.value.title))
    formData.append('size', form.value.size)
    formData.append('price', form.value.price.toString())
    formData.append('note', form.value.note)
    formData.append('totalStock', form.value.totalStock.toString())
    formData.append('forSale', form.value.forSale.toString())
    formData.append('filmmaker', form.value.filmmaker)
    if (form.value.year) formData.append('year', form.value.year.toString())
    formData.append('genre', form.value.genre)
    formData.append('country', form.value.country)
    form.value.tags.forEach((tag) => formData.append('tags[]', tag))
    form.value.locations.forEach((location) => formData.append('locations[]', location))
    form.value.mainActors.forEach((actor) => formData.append('mainActors[]', actor))

    if (form.value.image instanceof File) {
      formData.append('image', form.value.image)
    } else if (typeof form.value.image === 'string' && form.value.image) {
      formData.append('image', form.value.image)
    }

    if (props.posterToEdit?._id) {
      await store.updatePoster(props.posterToEdit._id, formData)
      toast.success(t('form.poster.updateSuccess'))
    } else {
      await store.createPoster(formData)
      toast.success(t('form.poster.createSuccess'))
    }

    emit('saved')
    close()
  } catch (err) {
    console.error(err)
    toast.error(t('form.poster.error'))
  }
}
</script>

<style scoped lang="scss">
.poster-edit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 2rem 0;
}

.poster-edit-box {
  background: $darker-red;
  color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  margin: auto;
}

.poster-edit-preview {
  margin-top: 8px;

  img {
    max-width: 120px;
    max-height: 120px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #ccc;
  }
}

.poster-edit-close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
}

.poster-edit-duplicate-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-edit-duplicate-box {
  background: $darker-red;
  color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);

  p {
    margin: 0 0 16px;
  }
}

.poster-edit-duplicate-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.poster-edit-movie-results {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 160px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 4px;
}

.poster-edit-movie-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  img {
    width: 30px;
    height: 45px;
    object-fit: cover;
    border-radius: 3px;
  }

  em {
    margin-left: auto;
    opacity: 0.6;
    font-size: 11px;
  }
}

.btn-link {
  background: none;
  border: none;
  color: white;
  text-decoration: underline;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}

.poster-edit-movie-no-results {
  font-size: 13px;
  opacity: 0.8;
}

.poster-edit-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}

.poster-edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &--row {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    &:first-of-type {
      input {
        border: unset;
      }
    }
  }

  &--actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;

    button > b {
      margin-right: 8px;
    }
  }
}

.radio-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 4px;

  input {
    margin: 0;
  }

  label {
    margin: 0;
  }
}

.poster-edit-input {
  padding: 8px 10px;
  margin-left: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  flex-grow: 1;
  max-width: 90%;
}

.poster-edit-input.stock{
    max-width: 80px;
    margin-right: 0.5rem;
}

@media (max-width: $break-sm) {
  .poster-edit-form--row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .poster-edit-input {
    margin-left: 0;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
  }

  .poster-edit-input.stock {
    width: auto;
  }
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #1d4ed8;
  }
}

/* Transitions */
.poster-edit-fade-enter-active,
.poster-edit-fade-leave-active {
  transition: opacity 0.25s ease;
}
.poster-edit-fade-enter-from,
.poster-edit-fade-leave-to {
  opacity: 0;
}

.poster-edit-popup-enter-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.poster-edit-popup-enter-from {
  transform: scale(0.95);
  opacity: 0;
}
.poster-edit-popup-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
