"""pytest tools/den/tests: the species checker accepts good numbers and catches a wrong one"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import species_check
FIX = pathlib.Path(__file__).parent / 'species_fixture.yaml'

def test_fixture_catches_the_wrong_number():
    errs, notes = species_check.check_file(FIX)
    assert len(errs) == 1 and 'radius_over_humerus' in errs[0]
    assert sum(n.startswith('agrees') for n in notes) == 2

def test_missing_source_is_an_error(tmp_path):
    f = tmp_path / 's.yaml'; f.write_text('id: x\nname: X\nbase: hero2\nnumbers:\n  bones:\n    a: {value: 1, unit: ratio, confidence: A}\n')
    errs, _ = species_check.check_file(f); assert errs and 'source' in errs[0]
