import { useState, useEffect } from 'react';
import { Gender } from '../../../shared-core/models/Person.js';

export function PersonEditModal({ person, onSave, onCancel, onDelete, t, lang }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    maidenName: '',
    birthDate: '',
    deathDate: '',
    photo: '',
    gender: '',
  });

  // Convert YYYY-MM-DD to DD-MM-YYYY for Polish display
  const formatDateForDisplay = (date) => {
    if (!date) return '';
    if (lang === 'pl' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-');
      return `${day}-${month}-${year}`;
    }
    return date;
  };

  // Convert DD-MM-YYYY back to YYYY-MM-DD for storage
  const formatDateForStorage = (date) => {
    if (!date) return '';
    if (lang === 'pl' && date.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const [day, month, year] = date.split('-');
      return `${year}-${month}-${day}`;
    }
    return date;
  };

  useEffect(() => {
    if (person) {
      setFormData({
        firstName: person.data.firstName || '',
        lastName: person.data.lastName || '',
        maidenName: person.data.maidenName || '',
        birthDate: formatDateForDisplay(person.data.birthDate || ''),
        deathDate: formatDateForDisplay(person.data.deathDate || ''),
        photo: person.data.photo || '',
        gender: person.data.gender || '',
      });
    }
  }, [person, lang]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert dates back to storage format before saving
    onSave({
      ...formData,
      birthDate: formatDateForStorage(formData.birthDate),
      deathDate: formatDateForStorage(formData.deathDate),
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!person) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <h2 style={{ marginTop: 0 }}>{t('editPerson')}</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              {t('firstName')}
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              {t('lastName')}
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              {t('gender')}
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="">{t('other')}</option>
              <option value={Gender.MALE}>{t('male')}</option>
              <option value={Gender.FEMALE}>{t('female')}</option>
            </select>
            <small style={{ color: '#666' }}>
              {t('male')}: Blue border, {t('female')}: Pink border
            </small>
          </div>

          {/* Maiden name field - only show for females */}
          {formData.gender === Gender.FEMALE && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                {t('maidenName')}
              </label>
              <input
                type="text"
                name="maidenName"
                value={formData.maidenName}
                onChange={handleChange}
                placeholder={t('maidenNamePlaceholder')}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              <small style={{ color: '#666' }}>
                {t('maidenNameHint')}
              </small>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              {t('birthDate')} {lang === 'pl' && <small>(dd-mm-rrrr)</small>}
            </label>
            <input
              type={lang === 'pl' ? 'text' : 'date'}
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              placeholder={lang === 'pl' ? 'dd-mm-rrrr' : ''}
              pattern={lang === 'pl' ? '\\d{2}-\\d{2}-\\d{4}' : undefined}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            {lang === 'pl' && (
              <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                Format: dzień-miesiąc-rok (np. 15-03-1990)
              </small>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              {t('deathDate')} {lang === 'pl' && <small>(dd-mm-rrrr)</small>}
            </label>
            <input
              type={lang === 'pl' ? 'text' : 'date'}
              name="deathDate"
              value={formData.deathDate}
              onChange={handleChange}
              placeholder={lang === 'pl' ? 'dd-mm-rrrr' : ''}
              pattern={lang === 'pl' ? '\\d{2}-\\d{2}-\\d{4}' : undefined}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            {lang === 'pl' && (
              <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                Format: dzień-miesiąc-rok (np. 20-12-2020)
              </small>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              {t('photoOptional')}
            </label>
            <input
              type="text"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              placeholder={t('photoPlaceholder')}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <small style={{ color: '#666' }}>
              {t('dragPersonToChangeGeneration')}
            </small>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => onDelete(person.id)}
              style={{
                padding: '10px 20px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                marginRight: 'auto',
              }}
            >
              {t('delete')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                background: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
